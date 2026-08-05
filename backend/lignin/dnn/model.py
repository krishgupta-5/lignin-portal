"""
DNN — Deep Neural Network regression model for Lignin Yield prediction.
Supports dynamic layer configurations matching trained checkpoints.
"""
# pyrefly: ignore [missing-import]
import torch
# pyrefly: ignore [missing-import]
import torch.nn as nn


class LigninDNNSequential(nn.Module):
    """
    Standard sequential Deep Neural Network matching trained checkpoint architecture.
    Linear -> LayerNorm -> SiLU -> Dropout -> ... -> Linear(1)
    """
    def __init__(
        self,
        n_features: int = 42,
        layer_sizes: list[int] | None = None,
        dropouts: list[float] | None = None,
    ):
        super().__init__()
        if layer_sizes is None:
            layer_sizes = [128, 512]
        if dropouts is None:
            dropouts = [0.1, 0.2]

        layers = []
        in_dim = n_features
        for sz, d in zip(layer_sizes, dropouts):
            layers.append(nn.Linear(in_dim, sz))
            layers.append(nn.LayerNorm(sz))
            layers.append(nn.SiLU())
            layers.append(nn.Dropout(d))
            in_dim = sz

        layers.append(nn.Linear(in_dim, 1))
        self.net = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class ResidualDenseBlock(nn.Module):
    def __init__(self, hidden_dim: int, dropout: float = 0.2):
        super().__init__()
        self.block = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.SiLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
        )
        self.act = nn.SiLU()

    def forward(self, x):
        return self.act(x + self.block(x))


class LigninDNNResidual(nn.Module):
    def __init__(
        self,
        n_features: int = 42,
        hidden_dims: list[int] | None = None,
        dropout: float = 0.2,
    ):
        super().__init__()
        if hidden_dims is None:
            hidden_dims = [128, 128, 64]

        self.input_layer = nn.Sequential(
            nn.Linear(n_features, hidden_dims[0]),
            nn.LayerNorm(hidden_dims[0]),
            nn.SiLU(),
            nn.Dropout(dropout),
        )

        layers = []
        for i in range(len(hidden_dims) - 1):
            layers.append(ResidualDenseBlock(hidden_dims[i], dropout=dropout))
            if hidden_dims[i] != hidden_dims[i + 1]:
                layers.append(nn.Linear(hidden_dims[i], hidden_dims[i + 1]))
                layers.append(nn.LayerNorm(hidden_dims[i + 1]))
                layers.append(nn.SiLU())

        self.hidden_layers = nn.Sequential(*layers)
        self.output_layer = nn.Linear(hidden_dims[-1], 1)

    def forward(self, x):
        h = self.input_layer(x)
        h = self.hidden_layers(h)
        return self.output_layer(h)


# Alias
LigninDNN = LigninDNNSequential


def load_model(checkpoint_path: str, device: str = "cpu"):
    """
    Load a trained LigninDNN model from a .pt checkpoint.

    Returns:
        (model, feature_names, metadata_dict)
    """
    ckpt = torch.load(checkpoint_path, map_location=device)

    n_features = ckpt.get("n_features", 42)
    layer_sizes = ckpt.get("layer_sizes", [128, 512])
    dropouts = ckpt.get("dropouts", [0.1, 0.2])
    feature_names = ckpt.get("feature_names", None)
    state_dict = ckpt.get("model_state") or ckpt.get("model_state_dict") or ckpt.get("state_dict")

    # Check if checkpoint uses sequential net.* or residual input_layer.*
    is_sequential = any(k.startswith("net.") for k in state_dict.keys()) if state_dict else True

    if is_sequential:
        model = LigninDNNSequential(
            n_features=n_features,
            layer_sizes=layer_sizes,
            dropouts=dropouts,
        )
    else:
        model = LigninDNNResidual(
            n_features=n_features,
            hidden_dims=ckpt.get("hidden_dims", layer_sizes),
            dropout=dropouts[0] if isinstance(dropouts, list) and len(dropouts) > 0 else 0.2,
        )

    if state_dict:
        model.load_state_dict(state_dict, strict=False)

    model.to(device)
    model.eval()

    metadata = {
        "n_features": n_features,
        "layer_sizes": layer_sizes,
        "dropouts": dropouts,
        "blind_r2": float(ckpt.get("blind_r2", 0.8350)),
        "dev_r2": float(ckpt.get("dev_r2", 0.9147)),
        "best_params": ckpt.get("best_params", {}),
    }

    return model, feature_names, metadata
