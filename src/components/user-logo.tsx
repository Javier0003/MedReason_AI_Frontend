export default function UserLogo({name, profession}: {name: string, profession: string}) {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-full bg-[#1565d8]/10 text-[#1565d8] flex items-center justify-center text-lg">
        <i className={profession === 'ADMIN' ? 'fa-solid fa-user-gear' : 'fa-solid fa-user-doctor'}></i>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">{name}</p>
        <p className="text-xs font-semibold text-slate-400">{profession}</p>
      </div>
    </div>
  )
}