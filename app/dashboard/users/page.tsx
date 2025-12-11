import prisma from "@/lib/prisma";

const Page = async () => {
  const users = await prisma.user.findMany();

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Users Table</h2>

      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Image URL</th>
            <th className="border p-2">Created At</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border p-2">{u.id}</td>
              <td className="border p-2">{u.firstName}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.role}</td>
              <td className="border p-2 cursor-pointer">
                <img
                  src={u.imageUrl ?? "/placeholder.png"}
                  alt="user image"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </td>
              <td className="border p-2">
                {new Date(u.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
