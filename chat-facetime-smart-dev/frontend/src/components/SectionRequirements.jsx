import React from "react";

const items = [
  { text: "A developer familiar with React", checked: true, disabled: false },
  { text: "No, seriously.", checked: false, disabled: true },
  { text: "That’s it.", checked: false, disabled: true },
  { text: "That’s the only item.", checked: false, disabled: true },
  { text: "Also we’re out of milk.", checked: false, disabled: true },
];

export default function SectionRequirements() {
  return (
    <section className="w-full bg-[#e9f9ff] py-12 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-5xl md:text-3xl  text-gray-900 mb-8">
          With SimpleWebRTC, here’s all you need:
        </h2>

        {/* Checklist box */}
        <form
          className="mx-auto max-w-2xl bg-white rounded-lg shadow-sm border border-transparent overflow-hidden"
          aria-labelledby="requirements-heading"
        >
          {/* divide-y tạo các đường phân cách; divide color dùng custom #00b0eb với opacity nhỏ */}
          <div className="divide-y divide-[#00b0eb]/20">
            {items.map((it, idx) => (
              <label
                key={idx}
                className={
                  "flex items-center gap-4 px-6 py-5 cursor-pointer " +
                  (it.disabled ? "opacity-70 cursor-default" : "hover:bg-gray-50")
                }
              >
                <input
                  type="checkbox"
                  checked={it.checked}
                  disabled={it.disabled}
                  readOnly
                  className="h-5 w-5 rounded border-gray-300 accent-[#00b0eb] focus:ring-[#00b0eb]"
                />
                <span className="text-left text-gray-700">{it.text}</span>
              </label>
            ))}
          </div>
        </form>

        {/* Description under */}
        <div className="mt-8 ml-12 text-gray-700 space-y-4 text-base leading-relaxed text-left">
          <p>
            Really. We’ll take care of the rest. Secure streaming video, voice,
            and screen-sharing, hosted by us, in your website or application.
          </p>
          <p>
            We’ll handle the UX edge cases. We’ll handle the uptime. We’ll take
            care of the annoying boring parts so you can focus on building and
            scaling your awesome idea.
          </p>
        </div>
      </div>
    </section>
  );
}
