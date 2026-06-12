export default function UserLogo({name, profession}: {name: string, profession: string}) {
  return (
    <div className="flex items-center space-x-3">
      <img src="/favicon.svg" alt="Profile Image" className="w-10 h-10 rounded-full" />
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-gray-500">{profession}</p>
      </div>
    </div>
  )
}