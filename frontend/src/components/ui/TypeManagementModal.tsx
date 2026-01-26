import React, { useState, useEffect } from "react";
import { AssetCategory, AssetType, Asset, TrackingMethod, ItemClassification } from "../../types";
import Modal from "./Modal";
import { PencilIcon } from "../icons/PencilIcon";
import { TrashIcon } from "../icons/TrashIcon";
import { SpinnerIcon } from "../icons/SpinnerIcon";
import { ExclamationTriangleIcon } from "../icons/ExclamationTriangleIcon";
import { InboxIcon } from "../icons/InboxIcon";
import { useNotification } from "../../providers/NotificationProvider";
import { BsTools, BsLightningFill } from "react-icons/bs";

// Store
import { useAssetStore } from "../../stores/useAssetStore";

interface TypeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentCategory: AssetCategory;
  typeToEdit: AssetType | null;
  // Legacy Props (optional - kept for compatibility but not used for logic)
  assets?: Asset[];
  onSave?: (
    parentCategory: AssetCategory,
    typeData: Omit<AssetType, "id" | "standardItems">,
    typeId?: number
  ) => void;
  onDelete?: (parentCategory: AssetCategory, typeToDelete: AssetType) => void;
  defaultClassification?: ItemClassification;
}

interface TypeToDelete extends AssetType {
  assetCount: number;
}

export const TypeManagementModal: React.FC<TypeManagementModalProps> = ({
  isOpen,
  onClose,
  parentCategory,
  typeToEdit,
  assets: propAssets,
  // onSave & onDelete props are bypassed in favor of Store Actions for consistency
  defaultClassification = "asset",
}) => {
  // Store hooks
  const storeAssets = useAssetStore((state) => state.assets);
  const assetCategories = useAssetStore((state) => state.categories);

  // PERUBAHAN 1: Ambil action baru dari store
  const createType = useAssetStore((state) => state.createType);
  const updateTypeDetails = useAssetStore((state) => state.updateTypeDetails);
  const deleteType = useAssetStore((state) => state.deleteType);

  // Use store assets if available
  const assets = storeAssets.length > 0 ? storeAssets : propAssets || [];

  // Derived state (Re-fetch category from store to get latest types)
  const category = assetCategories.find((c) => c.id === parentCategory.id) || parentCategory;
  const types = category.types || [];

  const [name, setName] = useState("");
  const [classification, setClassification] = useState<ItemClassification>(defaultClassification);
  const [trackingMethod, setTrackingMethod] = useState<TrackingMethod>("individual");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<TypeToDelete | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const addNotification = useNotification();

  const isEditing = editingId !== null;

  // Effect untuk inisialisasi data
  useEffect(() => {
    if (isOpen) {
      if (typeToEdit) {
        setEditingId(typeToEdit.id);
        setName(typeToEdit.name);
        setClassification(typeToEdit.classification || "asset");
        setTrackingMethod(typeToEdit.trackingMethod || "individual");
      } else {
        resetForm();
      }
    } else {
      resetForm();
    }
  }, [isOpen, typeToEdit, defaultClassification]);

  // Logika Otomatisasi
  useEffect(() => {
    if (!isEditing) {
      if (classification === "material") {
        setTrackingMethod("bulk");
      } else {
        setTrackingMethod("individual");
      }
    }
  }, [classification, isEditing]);

  const resetForm = () => {
    setName("");
    setClassification(defaultClassification);
    const isMaterialTab = defaultClassification === "material";
    setTrackingMethod(isMaterialTab ? "bulk" : "individual");
    setEditingId(null);
    setIsLoading(false);
  };

  const handleEditClick = (type: AssetType) => {
    setEditingId(type.id);
    setName(type.name);
    setClassification(type.classification || "asset");
    setTrackingMethod(type.trackingMethod || "individual");
  };

  const handleDeleteClick = (type: AssetType) => {
    const assetCount = assets.filter(
      (asset) => asset.category === category.name && asset.type === type.name
    ).length;
    setTypeToDelete({ ...type, assetCount });
  };

  // PERUBAHAN 2: Gunakan deleteType dari Store
  const handleConfirmDelete = async () => {
    if (typeToDelete && typeToDelete.assetCount === 0) {
      setIsLoading(true);
      try {
        // Panggil Action Store: deleteType
        await deleteType(typeToDelete.id, category.id);
        addNotification(`Tipe "${typeToDelete.name}" berhasil dihapus.`, "success");
      } catch (error) {
        console.error(error);
        addNotification("Gagal menghapus tipe.", "error");
      } finally {
        setIsLoading(false);
        setTypeToDelete(null);
      }
    }
  };

  // PERUBAHAN 3: Gunakan createType / updateTypeDetails dari Store
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addNotification("Nama tipe harus diisi.", "error");
      return;
    }

    if (classification === "material" && !category.isCustomerInstallable) {
      addNotification(
        "Peringatan: Material seharusnya berada dalam Kategori yang dapat dipasang ke pelanggan.",
        "warning"
      );
    }

    setIsLoading(true);

    try {
      const typeData = {
        name,
        // Mapping manual ke Uppercase sesuai permintaan Backend
        classification: classification === "material" ? "MATERIAL" : "ASSET",
        trackingMethod: trackingMethod === "bulk" ? "BULK" : "INDIVIDUAL",
        categoryId: category.id,
      };

      if (editingId) {
        // UPDATE (PATCH)
        await updateTypeDetails(editingId, typeData);
        addNotification(`Tipe "${name}" berhasil diperbarui.`, "success");
      } else {
        // CREATE (POST)
        await createType(typeData);
        addNotification(`Tipe "${name}" berhasil ditambahkan.`, "success");
      }

      resetForm();
    } catch (error) {
      console.error(error);
      addNotification("Gagal menyimpan tipe. Pastikan koneksi server aman.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- JSX (Render UI) Tetap Sama ---
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Kelola Tipe & Material`}
        size="2xl"
        hideDefaultCloseButton
        disableContentPadding
      >
        <div className="p-6 space-y-6">
          <div className="p-3 text-sm text-blue-800 bg-blue-50/70 rounded-lg border border-blue-200/50">
            Mengelola Tipe untuk Kategori:{" "}
            <strong className="font-semibold">{category.name}</strong>
          </div>

          {/* Form Section */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-base font-semibold text-gray-800 mb-3">
              {isEditing ? "Edit Tipe" : "Tambah Tipe Baru"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="typeName" className="block text-sm font-medium text-gray-700">
                  Nama Tipe / Material
                </label>
                <input
                  type="text"
                  id="typeName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Router, Dropcore 1 Core, Patchcord"
                  required
                  className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konfigurasi Item (Otomatis)
                  </label>
                  {classification === "asset" ? (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-primary-600 rounded-full flex-shrink-0">
                        <BsTools />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">
                          Aset Tetap (Device & Tools)
                        </div>
                        <div className="text-xs text-gray-500">
                          Metode Pelacakan:{" "}
                          <span className="font-bold text-primary-600">Individual (SN & MAC)</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-full flex-shrink-0">
                          <BsLightningFill />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-gray-900">
                            Material (Consumables)
                          </div>
                          <div className="text-xs text-gray-500">
                            Metode Pelacakan:{" "}
                            <span className="font-bold text-orange-600">Massal (Bulk)</span>.
                            Konfigurasi detail stok diatur pada level Model.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
                  >
                    Batal Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 rounded-lg shadow-sm bg-primary-600 hover:bg-primary-700 disabled:bg-primary-600/70"
                >
                  {isLoading && <SpinnerIcon className="w-5 h-5 mr-2" />}
                  {isEditing ? "Simpan Perubahan" : "Tambah Tipe"}
                </button>
              </div>
            </form>
          </div>

          {/* List Section */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              Daftar Tipe ({types.length})
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2 -mr-2">
              {types.length > 0 ? (
                types.map((type) => {
                  const modelCount = type.standardItems?.length || 0;
                  const assetCount = assets.filter(
                    (a) => a.category === category.name && a.type === type.name
                  ).length;
                  const isMaterial = type.classification === "material";

                  return (
                    <div
                      key={type.id}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${editingId === type.id ? "bg-blue-100 border border-primary-600" : "bg-gray-50/70 border border-transparent"}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{type.name}</p>
                          {isMaterial ? (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold text-orange-700 bg-orange-100 rounded border border-orange-200 uppercase">
                              Material
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-100 rounded border border-blue-200 uppercase">
                              Aset
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {modelCount} Model &bull; {assetCount} Item
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditClick(type)}
                          className="p-1.5 text-gray-500 rounded-md hover:bg-yellow-100 hover:text-yellow-700"
                          title="Edit Tipe"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(type)}
                          className="p-1.5 text-gray-500 rounded-md hover:bg-red-100 hover:text-red-700"
                          title="Hapus Tipe"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
                  <InboxIcon className="w-10 h-10 text-gray-400" />
                  <p className="mt-2 text-sm">Belum ada tipe untuk kategori ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {typeToDelete && (
        <Modal
          isOpen={!!typeToDelete}
          onClose={() => setTypeToDelete(null)}
          title={typeToDelete.assetCount > 0 ? "Tidak Dapat Menghapus" : "Konfirmasi Hapus Tipe"}
          size="md"
          hideDefaultCloseButton
        >
          <div className="text-center">
            <div
              className={`flex items-center justify-center w-12 h-12 mx-auto rounded-full ${typeToDelete.assetCount > 0 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"}`}
            >
              <ExclamationTriangleIcon className="w-8 h-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              {typeToDelete.assetCount > 0 ? `Tipe Sedang Digunakan` : `Hapus Tipe?`}
            </h3>
            {typeToDelete.assetCount > 0 ? (
              <p className="mt-2 text-sm text-gray-600">
                Anda tidak dapat menghapus tipe{" "}
                <span className="font-bold">"{typeToDelete.name}"</span> karena masih ada{" "}
                {typeToDelete.assetCount} aset yang terhubung.
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-600">
                Anda yakin ingin menghapus tipe{" "}
                <span className="font-bold">"{typeToDelete.name}"</span>? Tindakan ini tidak dapat
                diurungkan.
              </p>
            )}
          </div>
          <div className="flex items-center justify-end pt-5 mt-5 space-x-3 border-t">
            {typeToDelete.assetCount > 0 ? (
              <button
                type="button"
                onClick={() => setTypeToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
              >
                Mengerti
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setTypeToDelete(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700"
                >
                  {isLoading ? <SpinnerIcon className="w-4 h-4" /> : "Ya, Hapus"}
                </button>
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};
