import torch
import torch.nn as nn

class CognitiveLSTM(nn.Module):
    def __init__(self, input_size=6, hidden_size=16, num_layers=2, output_size=1):
        super(CognitiveLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        # x shape: (batch_size, sequence_length, input_size)
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        
        out, _ = self.lstm(x, (h0, c0))
        # Take the output from the last time step
        out = self.fc(out[:, -1, :])
        return out
