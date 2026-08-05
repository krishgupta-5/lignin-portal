"""
NODE Augmented (v16 Extended) — Neural ODE with sample-weighted augmented dataset.
"""
# pyrefly: ignore [missing-import]
import torch
# pyrefly: ignore [missing-import]
import torch.nn as nn
# pyrefly: ignore [missing-import]
from torchdiffeq import odeint

STEP_SIZE = 0.10


class ODEFunc(nn.Module):
    def __init__(self, hidden: int = 56, dropout: float = 0.45):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(hidden + 1, hidden),
            nn.LayerNorm(hidden),
            nn.SiLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden, hidden),
            nn.Tanh(),
        )
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, nonlinearity="relu")
                if m.bias is not None:
                    nn.init.zeros_(m.bias)
        self.register_buffer("_nfe", torch.tensor(0, dtype=torch.long))

    def reset_nfe(self):
        self._nfe.zero_()

    def forward(self, t, h):
        self._nfe.add_(1)
        return self.net(torch.cat([h, t.expand(h.shape[0], 1)], dim=1))


class LigninAugmentedNODE(nn.Module):
    def __init__(self, n_in: int = 42, dropout: float = 0.45, hidden: int = 56):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(n_in, hidden),
            nn.LayerNorm(hidden),
            nn.SiLU(),
        )
        self.ode_func = ODEFunc(hidden, dropout)
        self.decoder = nn.Linear(hidden, 1)
        self.register_buffer("t_span", torch.tensor([0.0, 1.0]))
        nn.init.kaiming_normal_(self.decoder.weight, nonlinearity="relu")
        nn.init.zeros_(self.decoder.bias)

    def forward(self, x):
        h0 = self.encoder(x)
        h1 = odeint(
            self.ode_func,
            h0,
            self.t_span,
            method="rk4",
            options={"step_size": STEP_SIZE},
        )[-1]
        return self.decoder(h1)

    def reset_nfe(self):
        self.ode_func.reset_nfe()


def load_model(checkpoint_path: str, device: str = "cpu") -> tuple:
    """
    Load a trained Augmented/Extended LigninNODE from a .pt checkpoint.

    Returns:
        (model, feature_names, metadata_dict)
    """
    ckpt = torch.load(checkpoint_path, map_location=device, weights_only=False)

    n_features = ckpt["n_features"]
    hidden_dim = ckpt.get("hidden_dim", 56)
    dropout = ckpt.get("dropout", 0.45)
    feature_names = ckpt.get("feature_names")

    model = LigninAugmentedNODE(n_in=n_features, dropout=dropout, hidden=hidden_dim)
    model.load_state_dict(ckpt["model_state"])
    model.to(device)
    model.eval()

    metadata = {
        "n_features": n_features,
        "hidden_dim": hidden_dim,
        "dropout": dropout,
        "blind_r2": ckpt.get("blind_r2", 0.8335),
        "shap_top": ckpt.get("shap_top"),
        "extended": ckpt.get("extended", True),
    }

    return model, feature_names, metadata
