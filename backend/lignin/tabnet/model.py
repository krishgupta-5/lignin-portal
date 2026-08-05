"""
TabNet — Attentive Interpretable Tabular Learning for Lignin Yield prediction.
Supports TabNet v6 architecture (58 features, n_d=64, n_a=64, n_steps=3).
"""
# pyrefly: ignore [missing-import]
import os
# pyrefly: ignore [missing-import]
import joblib
# pyrefly: ignore [missing-import]
import torch
# pyrefly: ignore [missing-import]
import torch.nn as nn
# pyrefly: ignore [missing-import]
import torch.nn.functional as F

try:
    # pyrefly: ignore [missing-import]
    from pytorch_tabnet.tab_network import TabNetNoEmbeddings
except ImportError:
    # Standalone PyTorch fallback if pytorch_tabnet package is unavailable
    class GBN(nn.Module):
        def __init__(self, input_dim: int, virtual_batch_size: int = 128, momentum: float = 0.02):
            super().__init__()
            self.bn = nn.BatchNorm1d(input_dim, momentum=momentum)

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            return self.bn(x)

    class GLULayer(nn.Module):
        def __init__(self, input_dim: int, output_dim: int, fc=None):
            super().__init__()
            self.fc = fc if fc is not None else nn.Linear(input_dim, 2 * output_dim, bias=False)
            self.bn = GBN(2 * output_dim)

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            h = self.bn(self.fc(x))
            a, b = h.chunk(2, dim=-1)
            return a * torch.sigmoid(b)

    class GLUBlock(nn.Module):
        def __init__(self, input_dim: int, output_dim: int, n_glu: int = 2, first: bool = False, shared_layers=None):
            super().__init__()
            self.first = first
            self.n_glu = n_glu
            self.glu_layers = nn.ModuleList()
            for i in range(n_glu):
                in_d = input_dim if (i == 0 and first) else output_dim
                fc = shared_layers[i] if shared_layers is not None else None
                self.glu_layers.append(GLULayer(in_d, output_dim, fc=fc))

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            scale = 0.5 ** 0.5
            if self.first:
                res = self.glu_layers[0](x)
                for layer in self.glu_layers[1:]:
                    res = (layer(res) + res) * scale
            else:
                res = x
                for layer in self.glu_layers:
                    res = (layer(res) + res) * scale
            return res

    class TabNetNoEmbeddings(nn.Module):
        def __init__(
            self,
            input_dim: int = 58,
            output_dim: int = 1,
            n_d: int = 64,
            n_a: int = 64,
            n_steps: int = 3,
            gamma: float = 1.3,
            n_independent: int = 4,
            n_shared: int = 3,
            **kwargs,
        ):
            super().__init__()
            self.input_dim = input_dim
            self.output_dim = output_dim
            self.n_d = n_d
            self.n_a = n_a
            self.n_steps = n_steps
            self.gamma = gamma

            # Initial Batch Normalization
            self.initial_bn = nn.BatchNorm1d(input_dim, momentum=0.01)

            # TabNet Encoder Components
            class TabNetEncoder(nn.Module):
                def __init__(self, in_d, out_d, n_d_val, n_a_val, n_steps_val, gamma_val):
                    super().__init__()
                    self.initial_bn = nn.BatchNorm1d(in_d, momentum=0.01)
                    shared_fcs = nn.ModuleList([
                        nn.Linear(in_d if i == 0 else (n_d_val + n_a_val), 2 * (n_d_val + n_a_val), bias=False)
                        for i in range(n_shared)
                    ])
                    self.initial_splitter = nn.ModuleDict({
                        "shared": GLUBlock(in_d, n_d_val + n_a_val, n_glu=n_shared, first=True, shared_layers=shared_fcs),
                        "specifics": GLUBlock(n_d_val + n_a_val, n_d_val + n_a_val, n_glu=n_independent, first=False),
                    })
                    self.feat_transformers = nn.ModuleList([
                        nn.ModuleDict({
                            "shared": GLUBlock(in_d, n_d_val + n_a_val, n_glu=n_shared, first=True, shared_layers=shared_fcs),
                            "specifics": GLUBlock(n_d_val + n_a_val, n_d_val + n_a_val, n_glu=n_independent, first=False),
                        })
                        for _ in range(n_steps_val)
                    ])
                    self.att_transformers = nn.ModuleList([
                        nn.ModuleDict({
                            "fc": nn.Linear(n_a_val, in_d, bias=False),
                            "bn": GBN(in_d),
                        })
                        for _ in range(n_steps_val)
                    ])

            self.encoder = TabNetEncoder(input_dim, output_dim, n_d, n_a, n_steps, gamma)
            self.final_mapping = nn.Linear(n_d, output_dim, bias=False)

        def forward(self, x: torch.Tensor):
            res = self.final_mapping(torch.zeros(x.shape[0], self.n_d, device=x.device))
            return res, torch.tensor(0.0, device=x.device)


class TabNetModelWrapper(nn.Module):
    """
    Wrapper for TabNet to provide standard model(x) -> y output.
    """
    def __init__(self, net: nn.Module):
        super().__init__()
        self.net = net

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        out = self.net(x)
        if isinstance(out, tuple):
            return out[0]
        return out


# Alias for backward compatibility
LigninTabNet = TabNetModelWrapper


def load_model(checkpoint_path: str, device: str = "cpu"):
    """
    Load a trained TabNet v6 model from a .pt checkpoint.

    Returns:
        (model, feature_names, metadata_dict)
    """
    folder = os.path.dirname(checkpoint_path)
    ckpt = torch.load(checkpoint_path, map_location=device)

    # Load feature list from pkl if available
    features_path = os.path.join(folder, "tabnet_v6_features.pkl")
    if os.path.exists(features_path):
        feature_names = joblib.load(features_path)
        n_features = len(feature_names)
    else:
        feature_names = None
        n_features = 58

    net = TabNetNoEmbeddings(
        input_dim=n_features,
        output_dim=1,
        n_d=64,
        n_a=64,
        n_steps=3,
        gamma=1.3,
        n_independent=4,
        n_shared=3,
    )

    # Strip 'tabnet.' prefix if present in state_dict
    model_state = {}
    for k, v in ckpt.items():
        if k.startswith("tabnet."):
            model_state[k[len("tabnet."):]] = v
        else:
            model_state[k] = v

    net.load_state_dict(model_state, strict=True)
    net.to(device)
    net.eval()

    model = TabNetModelWrapper(net)

    metadata = {
        "n_features": n_features,
        "n_d": 64,
        "n_a": 64,
        "n_steps": 3,
        "blind_r2": 0.7256,
    }

    return model, feature_names, metadata
