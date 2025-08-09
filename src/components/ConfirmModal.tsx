import { Button } from "@/components/ui/button";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  slotId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (slotId: number) => void;
  slotId: number;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Confirm Booking</h3>
        <p className="mb-4 text-sm">
          Are you sure you want to book slot {slotId}?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="text-sm">
            Cancel
          </Button>
          <Button onClick={() => onConfirm(slotId)} className="text-sm">
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
