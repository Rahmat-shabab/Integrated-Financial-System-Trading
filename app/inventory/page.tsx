import Sidebar from "@/components/sidebar";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "@/lib/actions/products";
import Pagination from "@/components/pagination";
import { Prisma } from "@prisma/client";

type InventoryProductRow = {
  id: string;
  name: string;
  sku: string | null;
  price: Prisma.Decimal;
  quantity: number;
  lowStockAt: number | null;
  totalCount: number | bigint;
};

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const user = await getCurrentUser();
  const userId = user.id;
  const params = await searchParams;
  const q = (params.q ?? "").trim();

  const requestedPage = Number(params.page ?? 1);
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
  const pageSize = 10;

  const searchFilter = q
    ? Prisma.sql`AND "name" ILIKE ${`%${q}%`}`
    : Prisma.empty;

  const items = await prisma.$queryRaw<InventoryProductRow[]>`
    SELECT
      "id",
      "name",
      "sku",
      "price",
      "quantity",
      "lowStockAt",
      COUNT(*) OVER() AS "totalCount"
    FROM "Product"
    WHERE "userId" = ${userId} ${searchFilter}
    ORDER BY "createdAt" DESC
    LIMIT ${pageSize}
    OFFSET ${(page - 1) * pageSize}
  `;

  const totalCount = items.length > 0 ? Number(items[0].totalCount) : 0;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div>
      <Sidebar currentPath="/inventory" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Inventory
              </h1>
              <p className="text-sm text-gray-500">
                Manage your products and track inventory levels.
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          {/* Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <form className="flex gap-2" action="/inventory" method="GET">
              <input
                name="q"
                placeholder="Search products..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
              />
              <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Search
              </button>
            </form>
          </div>
          {/* Products Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase">
                    SKU
                  </th>
                  <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase">
                    Low Stock At
                  </th>
                  <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.sku || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.lowStockAt || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <form
                        action={deleteProduct}
                      >
                        <input type="hidden" name="id" value={product.id} />
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/inventory"
                searchParams={{ q, pageSize: String(pageSize) }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
