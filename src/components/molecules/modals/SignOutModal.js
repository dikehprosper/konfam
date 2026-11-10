import { useDispatch } from "react-redux";
import { clearClientData } from "../../../redux/features/client";
import { useModal } from "../../../context/ModalProvider";
export default function SignOutModal() {
  const { closeModal } = useModal(); const dispatch = useDispatch();
  const out = () => { localStorage.removeItem("Tkn"); dispatch(clearClientData()); window.location.replace("/"); };
  return (
    <div className="w-[320px] bg-popover p-5"><h3 className="font-semibold">Sign out?</h3>
      <p className="mt-2 text-xs text-muted">You'll need to sign in again to access your account, wallet, and positions.</p>
      <div className="mt-5 flex justify-end gap-2"><button onClick={closeModal} className="rounded-full bg-yesbg px-4 py-2 text-xs text-primary">Cancel</button>
        <button onClick={out} className="rounded-full bg-red-600 px-4 py-2 text-xs text-white">Sign out</button></div></div>
  );
}
