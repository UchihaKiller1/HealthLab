import React, { useState } from "react";

const categories = ["fitness","diet","sleep","mental health","other"];
const fieldTypes = ["text","number","checkbox","slider","dropdown"];

export default function CreateExperiment(){
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("fitness");
  const [image, setImage] = useState(null);
  const [durationDays, setDurationDays] = useState("");
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({ label: "", type: "text", options: "" });
  const [busy, setBusy] = useState(false);
  const [showReview, setShowReview] = useState(false);

  function addField(){
    if(fields.length >= 10) return alert("Max 10 fields");
    if(!newField.label.trim()) return alert("Label required");
    const field = { label: newField.label.trim(), type: newField.type };
    if(newField.type === "dropdown"){
      const opts = newField.options.split(",").map(s => s.trim()).filter(Boolean);
      if(opts.length === 0) return alert("Provide options for dropdown");
      field.options = opts;
    }
    setFields(prev => [...prev, field]);
    setNewField({ label: "", type: "text", options: "" });
  }

  function removeField(idx){
    setFields(prev => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(e){
    e.preventDefault();
    if(!title.trim() || !description.trim() || !image){
      return alert("Title, description and image are required");
    }
    // Open review modal first
    setShowReview(true);
  }

  async function onConfirmCreate(){
    setBusy(true);
    try{
      const token = localStorage.getItem("token");
      const form = new FormData();
      form.append("title", title.trim());
      form.append("description", description.trim());
      form.append("category", category);
      form.append("image", image);
      if(String(durationDays).trim() !== ""){
        form.append("durationDays", String(parseInt(durationDays, 10)));
      }
      form.append("formSchema", JSON.stringify(fields));
      const res = await fetch("http://localhost:4000/api/experiments", {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: form
      });
      const data = await res.json();
      if(!res.ok){
        alert(data?.message || data?.error || "Failed to create experiment");
      } else {
        alert("Experiment submitted for approval");
        window.location.href = "/";
      }
    }catch(err){
      alert("Network error: " + err.message);
    }finally{
      setBusy(false);
      setShowReview(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-[#2C5835] mb-4">Create Experiment</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="text-xs text-gray-600">Title</span>
          <input className="mt-1 block w-full rounded-md px-3 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#DBE4D3]" value={title} onChange={e=>setTitle(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs text-gray-600">Description</span>
          <textarea rows={4} className="mt-1 block w-full rounded-md px-3 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#DBE4D3]" value={description} onChange={e=>setDescription(e.target.value)} />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs text-gray-600">Category</span>
            <select className="mt-1 block w-full rounded-md px-3 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#DBE4D3]" value={category} onChange={e=>setCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-gray-600">Duration (days, optional)</span>
            <input type="number" min="1" placeholder="e.g., 7" className="mt-1 block w-full rounded-md px-3 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#DBE4D3]" value={durationDays} onChange={e=>setDurationDays(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs text-gray-600">Image</span>
            <input type="file" accept="image/*" className="mt-1 block w-full" onChange={e=>setImage(e.target.files?.[0] || null)} />
          </label>
        </div>

        <div className="mt-6 p-4 rounded-lg border border-gray-200">
          <div className="text-sm font-semibold text-[#2C5835] mb-2">Custom Fields</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="Label" className="rounded-md px-3 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#DBE4D3]" value={newField.label} onChange={e=>setNewField(s => ({...s, label: e.target.value}))} />
            <select className="rounded-md px-3 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#DBE4D3]" value={newField.type} onChange={e=>setNewField(s => ({...s, type: e.target.value}))}>
              {fieldTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {newField.type === "dropdown" && (
              <input placeholder="Options (comma separated)" className="rounded-md px-3 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#DBE4D3]" value={newField.options} onChange={e=>setNewField(s => ({...s, options: e.target.value}))} />
            )}
          </div>
          <div className="mt-3">
            <button type="button" onClick={addField} className="bg-[#75A64D] text-white px-4 py-2 rounded-lg hover:bg-[#2C5835] transition">Add field</button>
          </div>

          {fields.length > 0 && (
            <div className="mt-4">
              <div className="text-sm text-gray-700 mb-2">Preview</div>
              <div className="space-y-3">
                {fields.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#F7FAF4] rounded-md border border-gray-100">
                    <div className="text-sm">
                      <span className="font-medium text-[#2C5835]">{f.label}</span>
                      <span className="ml-2 text-gray-600">({f.type}{f.options ? ": " + f.options.join(", ") : ""})</span>
                    </div>
                    <button type="button" className="text-red-600 text-sm" onClick={()=>removeField(i)}>Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2">
          <button disabled={busy} type="submit" className="inline-flex justify-center items-center gap-2 rounded-md bg-[#75A64D] text-white px-4 py-2 hover:bg-[#2C5835] disabled:opacity-60">
            {busy ? "Submitting..." : "Submit for review"}
          </button>
        </div>
      </form>

      {showReview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl text-left">
            <h3 className="text-lg font-semibold text-[#2C5835] mb-4">Review Experiment</h3>
            <div className="space-y-2 text-sm text-gray-800">
              <div><span className="font-semibold">Title:</span> {title}</div>
              <div><span className="font-semibold">Description:</span> {description}</div>
              <div><span className="font-semibold">Category:</span> {category}</div>
              <div><span className="font-semibold">Duration:</span> {String(durationDays).trim() === "" ? "Open-ended" : `${parseInt(durationDays,10)} days`}</div>
              <div className="mt-3">
                <div className="font-semibold mb-1">Dynamic Fields:</div>
                {fields.length === 0 ? (
                  <div className="text-gray-600">No custom fields</div>
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    {fields.map((f, i) => (
                      <li key={i}>{f.label} ({f.type}{f.options ? ": "+f.options.join(", ") : ""})</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setShowReview(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-800">Back</button>
              <button type="button" disabled={busy} onClick={onConfirmCreate} className="px-4 py-2 rounded bg-[#75A64D] text-white hover:bg-[#2C5835]">{busy ? "Submitting..." : "Confirm & Submit"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


