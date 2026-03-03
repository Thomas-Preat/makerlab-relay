import { useState, useEffect } from "react";
import InventoryItem from "../components/inventory/InventoryItem";
import { useRole } from "../context/RoleContext";
import { nhost } from "../lib/nhost";

function Inventory() {
  const { role } = useRole();
  const [items, setItems] = useState([]);  // will be filled from the database
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", reference: "", category: "", quantity: 0, location: "", image: "" });
  const [newUnlimited, setNewUnlimited] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const categoryOptions = Array.from(
    new Set(
      items
        .map((currentItem) => (currentItem.category || "").trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  const handleBorrow = async (id) => {
    // optimistic UI update
    setItems(
      items.map(item =>
        item.id === id && item.quantity > 0
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );

    try {
      await nhost.graphql.request({
        query: `
          mutation DecrementItem($id: uuid!) {
            update_components_by_pk(pk_columns: {id: $id}, _inc: {quantity: -1}) {
              id
              quantity
            }
          }
        `,
        variables: { id }
      });
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'inventaire :", err);
      // in case of failure we could re-fetch or revert; skipping for brevity
    }
  };

  // teachers can modify an entry
  const handleUpdate = async (updated) => {
    // optimistic UI update
    setItems(items.map(i => (i.id === updated.id ? { ...i, ...updated } : i)));

    try {
      const { id, name, reference, category, quantity, location } = updated;
      const { image } = updated;
      await nhost.graphql.request({
        query: `
          mutation UpdateComponent($id: uuid!, $changes: components_set_input!) {
            update_components_by_pk(pk_columns: {id: $id}, _set: $changes) {
              id
              name
              reference
              category
              quantity
              location
              image
            }
          }
        `,
        variables: { id, changes: { name, reference, category, quantity, location, image } }
      });
    } catch (err) {
      console.error("Erreur lors de la modification d'un composant :", err);
      // optionally re-fetch or rollback
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Supprimer ce composant ?");
    if (!confirmed) return;

    const previousItems = items;
    setItems((prev) => prev.filter((inventoryItem) => inventoryItem.id !== id));

    try {
      await nhost.graphql.request({
        query: `
          mutation DeleteComponent($id: uuid!) {
            delete_components_by_pk(id: $id) {
              id
            }
          }
        `,
        variables: { id }
      });
    } catch (err) {
      console.error("Erreur lors de la suppression d'un composant :", err);
      setItems(previousItems);
    }
  };

  // fetch inventory items from Hasura on mount
  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await nhost.graphql.request({
          query: `
            query {
              components(order_by: { name: asc }) {
                id
                name
                reference
                slug
                category
                quantity
                location
                image
              }
            }
          `
        });
        setItems(res.body.data.components || []);
      } catch (err) {
        console.error("Erreur fetching components:", err);
      }
    }
    fetchItems();
  }, []);

  // helper to slugify a string (simple)
  const slugify = (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // teachers can add new item
  const handleAdd = async () => {
    let qtyValue;
    if (newUnlimited) {
      qtyValue = null;
    } else {
      const qty = Number(newItem.quantity);
      if (qty < 0) {
        alert("La quantité ne peut pas être négative");
        return;
      }
      qtyValue = qty;
    }
    const itemToInsert = {
      ...newItem,
      quantity: qtyValue,
      slug: slugify(newItem.name) || Date.now().toString()
    };
    try {
      const res = await nhost.graphql.request({
        query: `
          mutation InsertComponent($object: components_insert_input!) {
            insert_components_one(object: $object) {
              id
              name
              reference
              category
              quantity
              location
              slug
              image
            }
          }
        `,
        variables: { object: itemToInsert }
      });
      const added = res.body.data.insert_components_one;
      if (added) {
        setItems((prev) => [...prev, added]);
        setNewItem({ name: "", reference: "", category: "", quantity: 0, location: "", image: "" });
        setIsCustomCategory(false);
        setShowAdd(false);
      }
    } catch (err) {
      console.error("Erreur ajout composant:", err);
    }
  };

  // prepare filtered list based on search term (match name, reference or category)
  const displayed = items.filter(item => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      item.name.toLowerCase().includes(term) ||
      (item.reference || "").toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)
    );
  });

  return (
    <div className="inventory-page">
      <h1>Inventaire</h1>

      {role !== "student" && (
        <div className="inventory-top-actions">
          <button onClick={() => setShowAdd((s) => !s)}>
            {showAdd ? "Annuler" : "Ajouter un élément"}
          </button>
        </div>
      )}

      {showAdd && (
        <div className="inventory-add-panel">
          <h3>Nouveau composant</h3>
          <div className="inventory-form-row">
            <label>
              Nom: <input value={newItem.name} onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))} />
            </label>
          </div>
          <div className="inventory-form-row">
            <label>
              Référence: <input value={newItem.reference} onChange={e => setNewItem(prev => ({ ...prev, reference: e.target.value }))} placeholder="Ex: S140" />
            </label>
          </div>
          <div className="inventory-form-row">
            <label>
              Catégorie:
              <select
                value={isCustomCategory ? "__custom__" : (newItem.category || "")}
                onChange={(e) => {
                  const selected = e.target.value;
                  if (selected === "__custom__") {
                    setIsCustomCategory(true);
                    setNewItem(prev => ({ ...prev, category: "" }));
                    return;
                  }
                  setIsCustomCategory(false);
                  setNewItem(prev => ({ ...prev, category: selected }));
                }}
              >
                <option value="">Choisir une catégorie</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
                <option value="__custom__">Nouvelle catégorie...</option>
              </select>
            </label>
          </div>
          {isCustomCategory && (
            <div className="inventory-form-row">
              <label>
                Nouvelle catégorie: <input
                  value={newItem.category}
                  onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                />
              </label>
            </div>
          )}
          <div className="inventory-form-row">
            <label>
              Quantité: 
              <input
                type="number"
                min="0"
                disabled={newUnlimited}
                value={newItem.quantity}
                onChange={e => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
              />
            </label>
            <div className="inventory-checkbox-under">
              <label className="inventory-inline-checkbox">
                <input
                  type="checkbox"
                  checked={newUnlimited}
                  onChange={e => {
                    setNewUnlimited(e.target.checked);
                    if (e.target.checked) setNewItem(prev => ({ ...prev, quantity: null }));
                  }}
                />
                Quantité illimitée
              </label>
            </div>
          </div>
          <div className="inventory-form-row">
            <label>
              Emplacement: <input value={newItem.location} onChange={e => setNewItem(prev => ({ ...prev, location: e.target.value }))} />
            </label>
          </div>
          <div className="inventory-form-row">
            <label>
              Image (URL) : <input
                value={newItem.image || ""}
                placeholder="https://..."
                onChange={e => setNewItem(prev => ({ ...prev, image: e.target.value }))}
              />
            </label>
          </div>
          <div className="inventory-form-actions">
            <button onClick={handleAdd}>Enregistrer</button>
          </div>
        </div>
      )}

      <div className="inventory-search">
        <input
          type="text"
          placeholder="Rechercher par nom, référence ou catégorie..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {displayed.length === 0 ? (
        <p>Aucun article trouvé.</p>
      ) : (
        displayed.map(item => (
          <InventoryItem
            key={item.id}
            item={item}
            role={role}
            onBorrow={handleBorrow}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            categories={categoryOptions}
          />
        ))
      )}
    </div>
  );
}

export default Inventory;