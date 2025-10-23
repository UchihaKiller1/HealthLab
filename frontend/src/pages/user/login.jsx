import React, { useState } from "react";
import login_registerBG from "../../assets/login_registerBG.jpg";

export default function Login() {
  const [form, setForm] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((s) => ({ ...s, [name]: null }));
  };

  const onBlur = (e) => {
    const single = validateField(e.target.name, form[e.target.name]);
    setErrors((s) => ({ ...s, ...single }));
  };

  const validateField = (name, value) => {
    const e = {};
    if (name === "usernameOrEmail") {
      if (!value.trim()) e.usernameOrEmail = "Username or email is required";
      else if (value.includes("@")) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) e.usernameOrEmail = "Enter a valid email";
      } else {
        if (!/^[a-zA-Z0-9._-]{3,}$/.test(value)) e.usernameOrEmail = "Enter a valid username (3+ chars)";
      }
    }
    if (name === "password") {
      if (!value) e.password = "Password is required";
      else if (value.length < 8) e.password = "Minimum 8 characters";
    }
    return e;
  };

  const validate = () => {
    const e = {};
    if (!form.usernameOrEmail.trim()) e.usernameOrEmail = "Username or email is required";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Minimum 8 characters";
    return e;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const eObj = validate();
    if (Object.keys(eObj).length) {
      setErrors(eObj);
      return;
    }
    try{
      const res = await fetch("http://localhost:4000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if(!res.ok){
        alert(data?.message || data?.error || "Login failed");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/";
    }catch(err){
      alert("Network error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-[#DBE4D3] via-white to-[#DBE4D3]">
      {/* Left - Branding / Illustration (full-height on md+) */}
      <aside
        className="relative hidden md:flex flex-col justify-center items-start gap-6 p-12 text-white"
        style={{
          backgroundImage: `url(${login_registerBG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/30" aria-hidden />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">HealthLab</h1>
          </div>

          <h3 className="text-3xl font-bold leading-tight">Welcome back</h3>
          <p className="text-sm opacity-90">
            Sign in to continue contributing to community-collected public health research.
          </p>

          <ul className="space-y-2 mt-4 text-sm">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#DBE4D3] rounded-full/50 opacity-90" />
              Secure & privacy-first
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#DBE4D3] rounded-full/50 opacity-90" />
              Community-driven datasets
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#DBE4D3] rounded-full/50 opacity-90" />
              Open research APIs
            </li>
          </ul>
        </div>
      </aside>

      {/* Right - Form */}
      <main className="flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-[#2C5835]">Sign in</h1>
              <p className="text-sm text-gray-700">Access your HealthLab account.</p>
            </div>
            <div className="text-sm text-gray-600 hidden md:block">
              New here?{" "}
              <a href="/register" className="text-[#2C5835] font-medium hover:underline">
                Create account
              </a>
            </div>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <label className="block">
              <span className="text-xs text-gray-600">Username or email</span>
              <input
                name="usernameOrEmail"
                value={form.usernameOrEmail}
                onChange={onChange}
                onBlur={onBlur}
                className={`mt-1 block w-full rounded-md px-3 py-2 border ${
                  errors.usernameOrEmail ? "border-red-300" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-[#DBE4D3]`}
                placeholder="username or email"
                aria-invalid={!!errors.usernameOrEmail}
              />
              {errors.usernameOrEmail && <p className="text-xs text-red-600 mt-1">{errors.usernameOrEmail}</p>}
            </label>

            <label className="block">
              <span className="text-xs text-gray-600">Password</span>
              <div className="mt-1 relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={`block w-full rounded-md px-3 py-2 border ${
                    errors.password ? "border-red-300" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-[#DBE4D3]`}
                  placeholder="Password"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-2 text-gray-600 text-sm"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </label>

            <div className="flex items-center justify-between">
              <a href="/forgot" className="text-sm text-[#2C5835] hover:underline">
                Forgot password?
              </a>
            </div>

            <div>
              <button
                type="submit"
                className="w-full inline-flex justify-center items-center gap-2 rounded-md bg-[#75A64D] text-white px-4 py-2 hover:bg-[#2C5835] focus:outline-none focus:ring-2 focus:ring-[#DBE4D3]"
              >
                Sign in
              </button>
            </div>

            <p className="text-xs text-gray-600 text-center">
              By signing in you agree to our{" "}
              <a href="#" className="text-[#2C5835] hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-[#2C5835] hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </form>

          <div className="mt-6 text-center md:hidden">
            <span className="text-sm text-gray-600">
              New here?{" "}
              <a href="/register" className="text-[#2C5835] font-medium hover:underline">
                Create account
              </a>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
