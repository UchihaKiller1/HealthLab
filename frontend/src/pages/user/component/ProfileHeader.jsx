import React, { useEffect, useState } from "react";

const ProfileHeader = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    async function fetchUser() {
      try {
        if (!token) {
          const cached = localStorage.getItem("user");
          if (cached) setUser(JSON.parse(cached));
          setLoading(false);
          return;
        }
        const res = await fetch("http://localhost:4000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const cached = localStorage.getItem("user");
          if (cached) setUser(JSON.parse(cached));
          setLoading(false);
          return;
        }
        const data = await res.json();
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      } catch (e) {
        const cached = localStorage.getItem("user");
        if (cached) setUser(JSON.parse(cached));
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const fullName = user ? `${user.firstname || ""} ${user.lastname || ""}`.trim() : "";
  const email = user?.email || "";
  const username = user?.username || "";
  const bio = user?.bio || "";
  const avatar = user?.profilePicture
    ? user.profilePicture.startsWith("http")
      ? user.profilePicture
      : `http://localhost:4000/${user.profilePicture.replace(/^\/+/, "")}`
    : "https://via.placeholder.com/120";

  async function onSelectFile(ev) {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to update your profile picture.");
      return;
    }
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await fetch("http://localhost:4000/users/me/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || data?.error || "Upload failed");
        return;
      }
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      setShowModal(false);
      // reset the input value to allow re-uploading the same file if needed
      ev.target.value = "";
    } catch (e) {
      alert("Network error during upload");
    }
  }

  async function onRemove() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to remove your profile picture.");
      return;
    }
    try {
      const res = await fetch("http://localhost:4000/users/me/avatar", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || data?.error || "Remove failed");
        return;
      }
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      setShowModal(false);
    } catch (e) {
      alert("Network error during removal");
    }
  }

  async function onSaveProfile(ev) {
    ev.preventDefault();
    setEditError(null);
    const form = new FormData(ev.currentTarget);
    const updates = {
      firstname: form.get("firstname") || "",
      lastname: form.get("lastname") || "",
      username: form.get("username") || "",
      bio: form.get("bio") || ""
    };
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to update your profile.");
      return;
    }
    try{
      const res = await fetch("http://localhost:4000/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if(!res.ok){
        if (data?.message && /username already taken/i.test(data.message)) {
          setEditError(data.message);
          return;
        }
        alert(data?.message || data?.error || "Update failed");
        return;
      }
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      setShowEdit(false);
    }catch(e){
      alert("Network error during update");
    }
  }

  return (
    <section className="bg-[#DBE4D3] py-10 text-center">
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="block mx-auto rounded-full"
        aria-label="Change profile picture"
      >
        <img
          src={avatar}
          alt="User Avatar"
          className="w-28 h-28 rounded-full mx-auto border-4 border-[#75A64D] hover:opacity-90"
        />
      </button>
      <h1 className="mt-4 text-3xl font-bold text-[#2C5835]">
        {loading ? "Loading..." : fullName || user?.username || "User"}
      </h1>
      {!loading && (
        <>
          <p className="text-gray-700">@{username}</p>
          <p className="text-gray-700">{email}</p>
          {bio ? <p className="text-gray-600 mt-2 max-w-xl mx-auto">{bio}</p> : null}
          <button
            type="button"
            onClick={() => { setEditError(null); setShowEdit(true); }}
            className="mt-4 bg-[#75A64D] text-white px-6 py-2 rounded-lg hover:bg-[#2C5835] transition"
          >
            Edit Profile
          </button>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 text-left">
            <h3 className="text-lg font-semibold text-[#2C5835] mb-4">Profile picture</h3>
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm text-gray-600">Upload new</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onSelectFile}
                  className="mt-1 block w-full text-sm"
                />
              </label>
              <button
                type="button"
                onClick={onRemove}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Remove current
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 text-left">
            <h3 className="text-lg font-semibold text-[#2C5835] mb-4">Edit profile</h3>
            <form onSubmit={onSaveProfile} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700">First name</label>
                <input name="firstname" defaultValue={user?.firstname || ""} className="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Last name</label>
                <input name="lastname" defaultValue={user?.lastname || ""} className="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Username</label>
                <input name="username" defaultValue={user?.username || ""} className={`mt-1 w-full border rounded px-3 py-2 ${editError ? "border-red-400" : ""}`} />
                {editError && <p className="text-xs text-red-600 mt-1">{editError}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700">Bio (optional)</label>
                <textarea name="bio" defaultValue={user?.bio || ""} rows="3" className="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-800">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-[#75A64D] text-white hover:bg-[#2C5835]">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProfileHeader;
