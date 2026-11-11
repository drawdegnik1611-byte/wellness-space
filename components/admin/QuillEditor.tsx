"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css"; 

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center rounded-2xl border border-white/60 bg-white/40 text-sm font-medium text-slate-500 backdrop-blur-md">
      <svg className="mr-3 h-5 w-5 animate-spin text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Đang tải bộ soạn thảo...
    </div>
  ),
}) as any;

type QuillEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function QuillEditor({ value, onChange }: QuillEditorProps) {
  const modules = {
    toolbar: [
      [{ header: [2, 3, false] }], 
      ["bold", "italic", "underline", "strike"], 
      [{ list: "ordered" }, { list: "bullet" }], 
      ["link", "image", "blockquote"], 
      ["clean"], 
    ],
  };

  return (
    // Ép phong cách kính mờ và ghi đè viền mặc định của thư viện Quill
    <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md transition-all focus-within:border-sky-400 focus-within:bg-white/80 focus-within:ring-4 focus-within:ring-sky-100 [&_.ql-container]:border-none [&_.ql-container]:text-slate-700 [&_.ql-container]:font-sans [&_.ql-container]:text-base [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-b-white/60 [&_.ql-toolbar]:bg-white/50 [&_.ql-editor]:min-h-[300px]">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
      />
    </div>
  );
}