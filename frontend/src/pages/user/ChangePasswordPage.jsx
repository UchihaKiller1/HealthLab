import Navbar from "./component/Navbar";
import ChangePasswordForm from "./component/form/ChangePasswordForm";
import Footer from "./component/Footer";

export default function ChangePasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <ChangePasswordForm />
      </main>
      <Footer />
    </div>
  );
}
