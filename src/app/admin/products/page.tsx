"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getGalanaFirebaseAuth, isGalanaFirebaseClientConfigured } from "@/lib/galana-firebase-client";

type Product = {
  id: string;
  cat: string;
  catLabel: string;
  name: string;
  use: string;
  image: string;
  price?: number;
};

export default function AdminProductsPage() {
  const router = useRouter();
  const clientConfigured = isGalanaFirebaseClientConfigured();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(clientConfigured);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!clientConfigured) return;
    const fetchProducts = async () => {
      try {
        const auth = getGalanaFirebaseAuth();
        const token = await auth.currentUser?.getIdToken();
        if (!token) {
          router.replace("/admin/login");
          return;
        }
        const res = await fetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          await auth.signOut();
          router.replace("/admin/login");
          return;
        }
        const dataRes = await fetch("/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!dataRes.ok) throw new Error("Failed to fetch products");
        const data = await dataRes.json();
        setProducts(data.products);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [clientConfigured, router]);

  const handlePriceChange = async (productId: string, newPrice: number) => {
    try {
      setSaving(true);
      const auth = getGalanaFirebaseAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ price: newPrice }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update price");
      }
      // Optimistically update
      setProducts(
        products?.map((p) =>
          p.id === productId ? { ...p, price: newPrice } : p
        ) || []
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!clientConfigured) {
    return (
      <div className="admin-shell">
        <div className="admin-alert admin-alert-error">
          Add <code>NEXT_PUBLIC_FIREBASE_*</code> to enable the admin console.
        </div>
        <Link href="/">← Back</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-shell">
        <p className="admin-muted">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-shell">
        <div className="admin-alert admin-alert-error">{error}</div>
        <Link href="/admin">← Back</Link>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <h1 className="admin-h1">Products</h1>
      <p className="admin-muted">
        Edit product prices (in KES). Changes are saved immediately.
      </p>
      {!products || products.length === 0 ? (
        <p className="admin-muted">No products found.</p>
      ) : (
        <table className="admin-table admin-table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price (KES)</th>
              <th>Image</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.catLabel}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={p.price ?? 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      handlePriceChange(p.id, val);
                    }}
                    disabled={saving}
                    className="admin-input"
                  />
                </td>
                <td>
                  <img
                    src={p.image}
                    alt={p.name}
                    className="admin-product-image"
                  />
                </td>
                <td>{saving && "Saving…"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="admin-mt">
        <Link href="/admin" className="admin-btn admin-btn-ghost">
          ← Back to Requests
        </Link>
      </div>
    </div>
  );
}