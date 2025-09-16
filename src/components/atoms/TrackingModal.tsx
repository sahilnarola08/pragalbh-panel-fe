"use client";

import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Button } from "@mui/material";

interface TrackingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { trackingId: string; courierCompany: string }) => void;
  initialTrackingId?: string;
  initialCourierCompany?: string;
  loading?: boolean;
}

export default function TrackingModal({
  open,
  onClose,
  onSubmit,
  initialTrackingId = "",
  initialCourierCompany = "",
  loading = false,
}: TrackingModalProps) {
  const [trackingId, setTrackingId] = useState(initialTrackingId);
  const [courierCompany, setCourierCompany] = useState(initialCourierCompany);

  const handleSave = () => {
    if (!trackingId || !courierCompany) return;
    onSubmit({ trackingId, courierCompany });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Enter Tracking Details</DialogTitle>
      <DialogContent className="flex flex-col gap-4 pt-4">
        <input
          type="text"
          placeholder="Tracking ID"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Courier Company"
          value={courierCompany}
          onChange={(e) => setCourierCompany(e.target.value)}
          className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!trackingId || !courierCompany || loading}
          variant="contained"
          color="primary"
        >
          {loading ? "Saving..." : "Save & Move"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
