import React from "react";
import CustomModal from "~/components/CustomModal";
import { X, CheckCircle, UserCheck } from "lucide-react";

const FriendRequestSuccessModal = ({ open, onClose, data }) => {
  return (
    <CustomModal isOpen={open} onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Modal header */}
        <div className="p-6 flex justify-between items-center border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Friend Request
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-6">
          <div className="flex flex-col items-center py-4">
            <div className="bg-black rounded-full p-4 mb-6">
              <CheckCircle color="white" size={32} />
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Friend Request Sent!
            </h3>

            <p className="text-gray-500 text-center mb-8">
              Gửi lời mời thành công
            </p>

            <div className="bg-gray-50 w-full rounded-xl p-6 flex flex-col items-center space-y-5 mb-6">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <UserCheck size={28} className="text-white" />
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-black">
                    @{data.senderUsername}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium text-black">
                    @{data.recipientUsername}
                  </span>
                </div>

                <div className="mt-3 px-4 py-1.5 bg-gray-200 rounded-full">
                  <span className="text-xs font-medium text-gray-600">
                    {data.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <button
                onClick={onClose}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="flex items-center justify-center px-4 py-3 bg-black rounded-xl text-white font-medium hover:bg-gray-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default FriendRequestSuccessModal;
