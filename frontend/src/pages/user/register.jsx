import React, { useState } from "react";
import login_registerBG from "../../assets/login_registerBG.jpg";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((s) => ({ ...s, [name]: null }));
  };

  const onBlur = (e) => {
    // validate single field on blur
    const single = validateField(e.target.name, form[e.target.name]);
    setErrors((s) => ({ ...s, ...single }));
  };

  const validateField = (name, value) => {
    const e = {};
    switch (name) {
      case "firstName":
      case "lastName":
        if (!value.trim()) e[name] = `${name === "firstName" ? "First" : "Last"} name is required`;
        break;
      case "username":
        if (!value.trim()) e.username = "Username is required";
        else if (!/^[a-zA-Z0-9._-]{3,}$/.test(value)) e.username = "3+ chars: letters, numbers, . _ -";
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) e.email = "Enter a valid email";
        break;
      case "phone":
        if (!/^[0-9+\-\s()]{7,}$/.test(value)) e.phone = "Enter a valid phone";
        break;
      case "password":
        if (value.length < 8) e.password = "Password must be at least 8 characters";
        break;
      case "confirmPassword":
        if (value !== form.password) e.confirmPassword = "Passwords do not match";
        break;
      default:
        break;
    }
    return e;
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.username.trim()) e.username = "Username is required";
    else if (!/^[a-zA-Z0-9._-]{3,}$/.test(form.username)) e.username = "Username must be 3+ chars (letters/numbers/._-)";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Enter a valid email";
    if (!form.phone.match(/^[0-9+\-\s()]{7,}$/)) e.phone = "Enter a valid phone";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const onSubmit = (ev) => {
    ev.preventDefault();
    const eObj = validate();
    if (Object.keys(eObj).length) {
      setErrors(eObj);
      return;
    }
    // TODO: send to backend
    console.log("Register payload:", { ...form });
    alert("Registration submitted (demo).");
  };

  function scorePassword(pw) {
    let score = 0;
    if (!pw) return 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0..4
  }

  function pwLabel(score) {
    switch (score) {
      case 0:
      case 1:
        return { text: "Weak", color: "bg-red-500" };
      case 2:
        return { text: "Fair", color: "bg-[#DBE4D3]" };
      case 3:
        return { text: "Good", color: "bg-[#75A64D]" };
      case 4:
        return { text: "Strong", color: "bg-[#2C5835]" };
      default:
        return { text: "", color: "" };
    }
  }

  const pwScore = scorePassword(form.password);
  const pwInfo = pwLabel(pwScore);

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-[#DBE4D3] via-white to-[#DBE4D3]">
      {/* Left - Branding / Illustration (full-height on md+) */}
      <aside
        className="relative hidden md:flex flex-col justify-center items-start gap-6 p-12 text-white"
        style={{
          backgroundImage: `url(${login_registerBG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* optional dark overlay to keep text readable */}
        <div className="absolute inset-0 bg-black/30" aria-hidden />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">HealthLab</h1>
          </div>

          <h3 className="text-3xl font-bold leading-tight">Join HealthLab</h3>
          <p className="text-sm opacity-90">
            Contribute and access community-collected public health data. Create an account to collaborate with public health researchers and volunteers.
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

      {/* Right - Form (full-screen, no card) */}
      <main className="flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-[#2C5835]">Create your account</h1>
              <p className="text-sm text-gray-700">Start contributing to public health research.</p>
            </div>
            <div className="text-sm text-gray-600 hidden md:block">
              Already have an account?{" "}
              <a href="/login" className="text-[#2C5835] font-medium hover:underline">
                Sign in
              </a>
            </div>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-gray-600">First name</span>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={`mt-1 block w-full rounded-md px-3 py-2 border ${errors.firstName ? "border-red-300" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-[#DBE4D3]`}
                  placeholder="First"
                  aria-invalid={!!errors.firstName}
                />
                {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
              </label>

              <label className="block">
                <span className="text-xs text-gray-600">Last name</span>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={`mt-1 block w-full rounded-md px-3 py-2 border ${errors.lastName ? "border-red-300" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-[#DBE4D3]`}
                  placeholder="Last"
                  aria-invalid={!!errors.lastName}
                />
                {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
              </label>
            </div>

            <label className="block">
              <span className="text-xs text-gray-600">Username</span>
              <div className="mt-1">
                <input
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={`block w-full rounded-md px-3 py-2 border ${errors.username ? "border-red-300" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-[#DBE4D3]`}
                  placeholder="User Name"
                  aria-invalid={!!errors.username}
                />
              </div>
              {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username}</p>}
            </label>

            <label className="block">
              <span className="text-xs text-gray-600">Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                onBlur={onBlur}
                className={`mt-1 block w-full rounded-md px-3 py-2 border ${errors.email ? "border-red-300" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-[#DBE4D3]`}
                placeholder="Email"
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </label>

            <label className="block">
              <span className="text-xs text-gray-600">Phone</span>
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                onBlur={onBlur}
                className={`mt-1 block w-full rounded-md px-3 py-2 border ${errors.phone ? "border-red-300" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-[#DBE4D3]`}
                placeholder="+94 XXX XXX XXX"
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-gray-600">Password</span>
                <div className="mt-1 relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={`block w-full rounded-md px-3 py-2 border ${errors.password ? "border-red-300" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-[#DBE4D3]`}
                    placeholder="Minimum 8"
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
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-full bg-gray-100 h-2 rounded overflow-hidden">
                    <div className={`${pwInfo.color} h-2 rounded`} style={{ width: `${(pwScore / 4) * 100}%` }} />
                  </div>
                  <div className="text-xs text-gray-500 w-14 text-right">{pwInfo.text}</div>
                </div>
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
              </label>

              <label className="block">
                <span className="text-xs text-gray-600">Confirm password</span>
                <input
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={`mt-1 block w-full rounded-md px-3 py-2 border ${errors.confirmPassword ? "border-red-300" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-[#DBE4D3]`}
                  placeholder="Repeat password"
                  aria-invalid={!!errors.confirmPassword}
                />
                {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
              </label>
            </div>

            <div className="flex items-center justify-between gap-4">
              <button
                type="submit"
                className="flex-1 inline-flex justify-center items-center gap-2 rounded-md bg-[#75A64D] text-white px-4 py-2 hover:bg-[#2C5835] focus:outline-none focus:ring-2 focus:ring-[#DBE4D3]"
              >
                Register
              </button>
            </div>

            <p className="text-xs text-gray-600">
              By creating an account you agree to our{" "}
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
              Already have an account?{" "}
              <a href="/login" className="text-[#2C5835] font-medium hover:underline">
                Sign in
              </a>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}