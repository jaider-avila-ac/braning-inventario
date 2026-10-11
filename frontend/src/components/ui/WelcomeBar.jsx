import { Calendar } from "lucide-react";

export default function WelcomeBar({ userName, subtext = "Panel de control · SYS Comercial", date }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-xl p-4 text-white flex-1">
      <div>
        <div className="text-lg font-bold">Bienvenido, <span className="text-blue-200">{userName}</span></div>
        <div className="text-sm text-blue-100">{subtext}</div>
      </div>
      <div className="text-sm text-blue-100 text-right mt-2 sm:mt-0">
        <Calendar className="inline w-3 h-3 mr-1" />
        {date}
      </div>
    </div>
  );
}