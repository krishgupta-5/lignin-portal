"""
NODE v14 — Inference-only Neural ODE model architecture.
"""
# pyrefly: ignore [missing-import]
import torch
# pyrefly: ignore [missing-import]
import torch.nn as nn
# pyrefly: ignore [missing-import]
from torchdiffeq import odeint

HIDDEN = 64
STEP_SIZE = 0.10


class ODEFunc(nn.Module):
    """ODE dynamics for the Neural ODE block."""

    def __init__(self, hidden, dropout):
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


class LigninNODE(nn.Module):
    """Neural ODE model for lignin yield prediction."""

    def __init__(self, n_in, dropout):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(n_in, HIDDEN), nn.LayerNorm(HIDDEN), nn.SiLU()
        )
        self.ode_func = ODEFunc(HIDDEN, dropout)
        self.decoder = nn.Linear(HIDDEN, 1)
        self.register_buffer("t_span", torch.tensor([0.0, 1.0]))
        nn.init.kaiming_normal_(self.decoder.weight, nonlinearity="relu")
        nn.init.zeros_(self.decoder.bias)

    def forward(self, x):
        h0 = self.encoder(x)
        h1 = odeint(
            self.ode_func, h0, self.t_span,
            method="rk4", options={"step_size": STEP_SIZE}
        )[-1]
        return self.decoder(h1)

    def reset_nfe(self):
        self.ode_func.reset_nfe()


def load_model(checkpoint_path: str, device: str = "cpu") -> tuple:
    """
    Load a trained LigninNODE from a .pt checkpoint.

    Returns:
        (model, feature_names, metadata_dict)
    """
    ckpt = torch.load(checkpoint_path, map_location=device, weights_only=False)

    n_features = ckpt["n_features"]
    dropout = ckpt.get("dropout", 0.314)
    feature_names = ckpt["feature_names"]

    model = LigninNODE(n_features, dropout)
    model.load_state_dict(ckpt["model_state"])
    model.to(device)
    model.eval()

    metadata = {
        "n_features": n_features,
        "hidden_dim": ckpt.get("hidden_dim", HIDDEN),
        "dropout": dropout,
        "blind_r2": ckpt.get("blind_r2"),
        "shap_top": ckpt.get("shap_top"),
    }

    return model, feature_names, metadata
