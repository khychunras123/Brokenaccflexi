// Mass.js
function Mass({ data }) {
  if (!data) {
    return null; // Don't show anything if no data has been submitted yet
  }

  return React.createElement(
    "div",
    { className: "mt-6 mb-6 p-6 bg-[#00c77e]/10 border border-[#00c77e]/50 rounded-lg animate-pulse" },
    React.createElement(
      "div",
      { className: "flex items-center gap-3 mb-4" },
      React.createElement(
        "span",
        { className: "material-symbols-outlined text-[#00c77e]" },
        "check_circle"
      ),
      React.createElement(
        "span",
        { className: "font-bold text-[#00c77e]" },
        "របាយការណ៍ត្រូវបានបញ្ជូនដោយជោគជ័យ! (Submission Successful)"
      )
    ),
    React.createElement(
      "div",
      { className: "grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm bg-[#111417]/80 p-4 rounded-lg border border-[#363C4E]/50 text-[#d3c5ad] font-['Manrope']" },
      React.createElement("div", null, React.createElement("span", { className: "text-[#929AA5]" }, "ID:"), " ", React.createElement("span", { className: "text-white" }, "AUTO-001")),
      React.createElement("div", null, React.createElement("span", { className: "text-[#929AA5]" }, "Team:"), " ", React.createElement("span", { className: "text-white" }, data.teamPage || "មិនមាន")),
      React.createElement("div", null, React.createElement("span", { className: "text-[#929AA5]" }, "Branch:"), " ", React.createElement("span", { className: "text-[#F3BA2F] font-bold" }, data.branch || "មិនមាន")),
      React.createElement("div", null, React.createElement("span", { className: "text-[#929AA5]" }, "Name:"), " ", React.createElement("span", { className: "text-white" }, data.name || "មិនមាន")),
      React.createElement("div", null, React.createElement("span", { className: "text-[#929AA5]" }, "Phone:"), " ", React.createElement("span", { className: "text-white" }, data.phone || "មិនមាន")),
      React.createElement("div", null, React.createElement("span", { className: "text-[#929AA5]" }, "Purchase:"), " ", React.createElement("span", { className: "text-white" }, data.purchaseDate || "មិនមាន")),
      React.createElement("div", null, React.createElement("span", { className: "text-[#929AA5]" }, "Received:"), " ", React.createElement("span", { className: "text-white" }, data.receivedDate || "មិនមាន")),
      React.createElement("div", { className: "col-span-1 sm:col-span-2" }, React.createElement("span", { className: "text-[#929AA5]" }, "Product:"), " ", React.createElement("span", { className: "text-white" }, data.productName || "មិនមាន")),
      React.createElement("div", { className: "col-span-1 sm:col-span-2" }, React.createElement("span", { className: "text-[#929AA5]" }, "Problem:"), " ", React.createElement("span", { className: "text-white whitespace-pre-wrap" }, data.problemDesc || "មិនមាន")),
      React.createElement(
        "div",
        { className: "col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2" },
        React.createElement(
          "div",
          null,
          React.createElement("span", { className: "text-[#929AA5] block mb-2" }, "Invoice:"),
          data.invoice ? React.createElement("img", { src: data.invoice, className: "w-full h-auto max-h-48 object-cover bg-[#0B0E11] border border-[#363C4E] rounded", alt: "Invoice Preview" }) : React.createElement("span", { className: "text-white" }, "គ្មាន (No)")
        ),
        React.createElement(
          "div",
          null,
          React.createElement("span", { className: "text-[#929AA5] block mb-2" }, "Photo:"),
          data.photo ? React.createElement("img", { src: data.photo, className: "w-full h-auto max-h-48 object-cover bg-[#0B0E11] border border-[#363C4E] rounded", alt: "Photo Preview" }) : React.createElement("span", { className: "text-white" }, "គ្មាន (No)")
        )
      )
    )
  );
}

