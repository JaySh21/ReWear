import React from "react";

const SwapCard = ({ swap }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700 capitalize">
          {swap.type}
        </span>
        <span
          className={`text-xs px-2 py-1 rounded ${
            swap.status === "completed"
              ? "bg-green-100 text-green-700"
              : swap.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {swap.status}
        </span>
      </div>
      <div className="text-xs text-gray-500 mb-2">
        {new Date(swap.createdAt).toLocaleDateString()}
      </div>
      <div className="text-sm text-gray-600 mb-1">
        Request Item: {swap.requestItem?.title || "-"}
      </div>
      {swap.offeredItem && (
        <div className="text-sm text-gray-600 mb-1">
          Offered Item: {swap.offeredItem?.title}
        </div>
      )}
      <div className="text-xs text-gray-400 mt-auto">ID: {swap.id}</div>
    </div>
  );
};

export default SwapCard;
