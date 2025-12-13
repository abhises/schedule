import prisma from "@/lib/prisma";

export default async function Dashboard() {
  const users= await prisma.user.count();
  return (
    <div>
     <div className="container mx-auto p-4">
  {/* Grid: 3 columns on md+, 1 column on small screens */}
  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-10">
    
    {/* Box 1 */}
    <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center">
      <p className="text-gray-500 text-sm">Total Users</p>
      <p className="text-2xl font-bold text-blue-600">{users}</p>
    </div>

    {/* Box 2 */}
    <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center">
      <p className="text-gray-500 text-sm">Active Users</p>
      <p className="text-2xl font-bold text-green-600">0</p>
    </div>

    {/* Box 3 */}
    <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center">
      <p className="text-gray-500 text-sm">New Users</p>
      <p className="text-2xl font-bold text-purple-600">0</p>
    </div>

    {/* Row 2 */}
    <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center">
      <p className="text-gray-500 text-sm">Admins</p>
      <p className="text-2xl font-bold text-red-600">0</p>
    </div>

    <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center">
      <p className="text-gray-500 text-sm">Guests</p>
      <p className="text-2xl font-bold text-yellow-600">0</p>
    </div>

    <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center">
      <p className="text-gray-500 text-sm">Banned Users</p>
      <p className="text-2xl font-bold text-gray-600">0</p>
    </div>
  </div>
</div>

    </div>
  );
}
