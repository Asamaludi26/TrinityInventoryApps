/**
 * Bulk Import Modal for Categories, Types, and Models
 *
 * Features:
 * - Download Excel template
 * - Upload and parse Excel file
 * - Preview data before import
 * - Validate and show errors
 * - Smart duplicate detection
 */

import React, { useState, useCallback, useMemo } from "react";
import * as XLSX from "xlsx";
import Modal from "./Modal";
import { useAssetStore } from "../../stores/useAssetStore";
import { useMasterDataStore } from "../../stores/useMasterDataStore";
import { useNotification } from "../../providers/NotificationProvider";
import { SpinnerIcon } from "../icons/SpinnerIcon";
import { ExclamationTriangleIcon } from "../icons/ExclamationTriangleIcon";
import { TrashIcon } from "../icons/TrashIcon";
import { BsCheckCircleFill, BsDownload, BsUpload } from "react-icons/bs";
import { Division, ItemClassification, TrackingMethod } from "../../types";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Template column definitions
interface TemplateRow {
  kategori: string;
  deskripsiKategori?: string;
  divisi?: string;
  dapatDipasangPelanggan?: string;
  tipe: string;
  klasifikasi: string;
  metodeTracking: string;
  satuanUkur?: string;
  model: string;
  merek: string;
}

// Parsed data structure
interface ParsedCategory {
  name: string;
  isCustomerInstallable: boolean;
  associatedDivisions: number[];
  types: ParsedType[];
}

interface ParsedType {
  name: string;
  classification: ItemClassification;
  trackingMethod: TrackingMethod;
  unitOfMeasure?: string;
  models: ParsedModel[];
}

interface ParsedModel {
  name: string;
  brand: string;
}

// Validation error structure
interface ValidationError {
  row: number;
  column: string;
  message: string;
  severity: "error" | "warning";
}

// Import step type
type ImportStep = "upload" | "preview" | "importing" | "complete";

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedCategory[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    skipped: number;
  }>({ success: 0, failed: 0, skipped: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const categories = useAssetStore((state) => state.categories);
  const createCategory = useAssetStore((state) => state.createCategory);
  const createType = useAssetStore((state) => state.createType);
  const createModel = useAssetStore((state) => state.createModel);
  const fetchCategories = useAssetStore((state) => state.fetchCategories);
  const divisions = useMasterDataStore((state) => state.divisions);
  const addNotification = useNotification();

  // Reset state when modal closes
  const handleClose = useCallback(() => {
    setStep("upload");
    setFile(null);
    setParsedData([]);
    setErrors([]);
    setImportProgress(0);
    setImportResults({ success: 0, failed: 0, skipped: 0 });
    onClose();
  }, [onClose]);

  // Generate and download Excel template
  const downloadTemplate = useCallback(() => {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Template data with examples
    const templateData: TemplateRow[] = [
      {
        kategori: "Perangkat Jaringan",
        deskripsiKategori: "Perangkat untuk infrastruktur jaringan",
        divisi: "", // Kosong = Global
        dapatDipasangPelanggan: "Ya",
        tipe: "Router",
        klasifikasi: "Asset",
        metodeTracking: "Individual",
        satuanUkur: "",
        model: "RB450Gx4",
        merek: "MikroTik",
      },
      {
        kategori: "Perangkat Jaringan",
        deskripsiKategori: "",
        divisi: "",
        dapatDipasangPelanggan: "Ya",
        tipe: "Router",
        klasifikasi: "Asset",
        metodeTracking: "Individual",
        satuanUkur: "",
        model: "RB750Gr3",
        merek: "MikroTik",
      },
      {
        kategori: "Perangkat Jaringan",
        deskripsiKategori: "",
        divisi: "",
        dapatDipasangPelanggan: "Ya",
        tipe: "Switch",
        klasifikasi: "Asset",
        metodeTracking: "Individual",
        satuanUkur: "",
        model: "CRS326-24G-2S+",
        merek: "MikroTik",
      },
      {
        kategori: "Material Instalasi",
        deskripsiKategori: "Material habis pakai untuk instalasi",
        divisi: "Teknik",
        dapatDipasangPelanggan: "Ya",
        tipe: "Kabel Fiber",
        klasifikasi: "Material",
        metodeTracking: "Bulk",
        satuanUkur: "Meter",
        model: "FO Single Mode",
        merek: "Furukawa",
      },
      {
        kategori: "Material Instalasi",
        deskripsiKategori: "",
        divisi: "Teknik",
        dapatDipasangPelanggan: "Ya",
        tipe: "Kabel Fiber",
        klasifikasi: "Material",
        metodeTracking: "Bulk",
        satuanUkur: "Meter",
        model: "FO Multi Mode",
        merek: "Belden",
      },
    ];

    // Create main data sheet
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    ws["!cols"] = [
      { wch: 25 }, // kategori
      { wch: 35 }, // deskripsiKategori
      { wch: 20 }, // divisi
      { wch: 25 }, // dapatDipasangPelanggan
      { wch: 20 }, // tipe
      { wch: 15 }, // klasifikasi
      { wch: 15 }, // metodeTracking
      { wch: 15 }, // satuanUkur
      { wch: 25 }, // model
      { wch: 20 }, // merek
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Data Import");

    // Create instruction sheet
    const instructionData = [
      ["PANDUAN IMPORT DATA KATEGORI - MODEL"],
      [""],
      ["Kolom-kolom yang tersedia:"],
      [""],
      ["1. kategori (WAJIB)", "Nama kategori aset. Contoh: Perangkat Jaringan, Perangkat Komputer"],
      ["2. deskripsiKategori", "Deskripsi kategori (opsional)"],
      [
        "3. divisi",
        `Nama divisi khusus (kosongkan jika Global). Pilihan: ${divisions.map((d) => d.name).join(", ") || "Tidak ada divisi"}`,
      ],
      ["4. dapatDipasangPelanggan", "Apakah dapat dipasang ke pelanggan? Isi: Ya atau Tidak"],
      ["5. tipe (WAJIB)", "Nama tipe dalam kategori. Contoh: Router, Switch, Kabel Fiber"],
      ["6. klasifikasi (WAJIB)", "Jenis klasifikasi. Pilihan: Asset atau Material"],
      ["7. metodeTracking (WAJIB)", "Metode tracking. Pilihan: Individual atau Bulk"],
      ["8. satuanUkur", "Satuan ukur untuk Bulk. Contoh: Meter, Kg, Pcs (wajib jika Bulk)"],
      ["9. model (WAJIB)", "Nama model standar. Contoh: RB450Gx4, FO Single Mode"],
      ["10. merek (WAJIB)", "Nama merek/brand. Contoh: MikroTik, Cisco, Furukawa"],
      [""],
      ["CATATAN PENTING:"],
      ["- Satu baris = satu model"],
      ["- Kategori & Tipe yang sama akan digabungkan otomatis"],
      ["- Data duplikat akan dilewati (tidak diimport ulang)"],
      ["- Hapus baris contoh sebelum upload"],
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionData);
    wsInstructions["!cols"] = [{ wch: 35 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Panduan");

    // Download file
    XLSX.writeFile(wb, "Template_Import_Kategori_Model.xlsx");
    addNotification("Template berhasil diunduh!", "success");
  }, [divisions, addNotification]);

  // Parse division name to ID
  const parseDivision = useCallback(
    (divisionName: string): number[] => {
      if (!divisionName || divisionName.trim() === "") return [];

      const divNames = divisionName.split(",").map((d) => d.trim());
      const divIds: number[] = [];

      for (const name of divNames) {
        const div = divisions.find((d) => d.name.toLowerCase() === name.toLowerCase());
        if (div) divIds.push(div.id);
      }

      return divIds;
    },
    [divisions]
  );

  // Validate and parse Excel file
  const parseExcelFile = useCallback(
    async (
      file: File
    ): Promise<{
      data: ParsedCategory[];
      errors: ValidationError[];
    }> => {
      return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });

            // Get first sheet (Data Import)
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json<TemplateRow>(worksheet);

            const errors: ValidationError[] = [];
            const categoryMap = new Map<string, ParsedCategory>();

            jsonData.forEach((row, index) => {
              const rowNum = index + 2; // Excel rows start at 1, plus header

              // Validate required fields
              if (!row.kategori || row.kategori.trim() === "") {
                errors.push({
                  row: rowNum,
                  column: "kategori",
                  message: "Nama kategori wajib diisi",
                  severity: "error",
                });
                return;
              }

              if (!row.tipe || row.tipe.trim() === "") {
                errors.push({
                  row: rowNum,
                  column: "tipe",
                  message: "Nama tipe wajib diisi",
                  severity: "error",
                });
                return;
              }

              if (!row.model || row.model.trim() === "") {
                errors.push({
                  row: rowNum,
                  column: "model",
                  message: "Nama model wajib diisi",
                  severity: "error",
                });
                return;
              }

              if (!row.merek || row.merek.trim() === "") {
                errors.push({
                  row: rowNum,
                  column: "merek",
                  message: "Merek wajib diisi",
                  severity: "error",
                });
                return;
              }

              // Validate classification
              const klassifikasi = (row.klasifikasi || "Asset").toLowerCase();
              if (!["asset", "material"].includes(klassifikasi)) {
                errors.push({
                  row: rowNum,
                  column: "klasifikasi",
                  message: `Klasifikasi tidak valid: ${row.klasifikasi}. Gunakan: Asset atau Material`,
                  severity: "error",
                });
                return;
              }

              // Validate tracking method
              const tracking = (row.metodeTracking || "Individual").toLowerCase();
              if (!["individual", "bulk"].includes(tracking)) {
                errors.push({
                  row: rowNum,
                  column: "metodeTracking",
                  message: `Metode tracking tidak valid: ${row.metodeTracking}. Gunakan: Individual atau Bulk`,
                  severity: "error",
                });
                return;
              }

              // Warn if bulk without unit
              if (tracking === "bulk" && (!row.satuanUkur || row.satuanUkur.trim() === "")) {
                errors.push({
                  row: rowNum,
                  column: "satuanUkur",
                  message: "Satuan ukur sebaiknya diisi untuk metode Bulk",
                  severity: "warning",
                });
              }

              // Check for duplicates in existing data
              const existingCategory = categories.find(
                (c) => c.name.toLowerCase() === row.kategori.trim().toLowerCase()
              );

              if (existingCategory) {
                const existingType = existingCategory.types?.find(
                  (t) => t.name.toLowerCase() === row.tipe.trim().toLowerCase()
                );

                if (existingType) {
                  const existingModel = (existingType.models || existingType.standardItems)?.find(
                    (m) =>
                      m.name.toLowerCase() === row.model.trim().toLowerCase() &&
                      m.brand.toLowerCase() === row.merek.trim().toLowerCase()
                  );

                  if (existingModel) {
                    errors.push({
                      row: rowNum,
                      column: "model",
                      message: `Model "${row.model}" (${row.merek}) sudah ada di tipe "${row.tipe}"`,
                      severity: "warning",
                    });
                  }
                }
              }

              // Build category structure
              const categoryName = row.kategori.trim();
              const categoryKey = categoryName.toLowerCase();

              if (!categoryMap.has(categoryKey)) {
                categoryMap.set(categoryKey, {
                  name: categoryName,
                  isCustomerInstallable: (row.dapatDipasangPelanggan || "").toLowerCase() === "ya",
                  associatedDivisions: parseDivision(row.divisi || ""),
                  types: [],
                });
              }

              const category = categoryMap.get(categoryKey)!;

              // Find or create type
              const typeName = row.tipe.trim();
              const typeKey = typeName.toLowerCase();
              let type = category.types.find((t) => t.name.toLowerCase() === typeKey);

              if (!type) {
                type = {
                  name: typeName,
                  classification: klassifikasi as ItemClassification,
                  trackingMethod: tracking as TrackingMethod,
                  unitOfMeasure: row.satuanUkur?.trim() || undefined,
                  models: [],
                };
                category.types.push(type);
              }

              // Add model (check for duplicates within import)
              const modelName = row.model.trim();
              const brandName = row.merek.trim();
              const modelExists = type.models.some(
                (m) =>
                  m.name.toLowerCase() === modelName.toLowerCase() &&
                  m.brand.toLowerCase() === brandName.toLowerCase()
              );

              if (!modelExists) {
                type.models.push({
                  name: modelName,
                  brand: brandName,
                });
              }
            });

            resolve({
              data: Array.from(categoryMap.values()),
              errors,
            });
          } catch (error) {
            console.error("Error parsing Excel:", error);
            resolve({
              data: [],
              errors: [
                {
                  row: 0,
                  column: "file",
                  message: "Gagal membaca file Excel. Pastikan format file benar.",
                  severity: "error",
                },
              ],
            });
          }
        };

        reader.onerror = () => {
          resolve({
            data: [],
            errors: [
              {
                row: 0,
                column: "file",
                message: "Gagal membaca file",
                severity: "error",
              },
            ],
          });
        };

        reader.readAsArrayBuffer(file);
      });
    },
    [categories, parseDivision]
  );

  // Handle file selection
  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
        addNotification("Format file tidak didukung. Gunakan file Excel (.xlsx, .xls)", "error");
        return;
      }

      setFile(selectedFile);

      const { data, errors } = await parseExcelFile(selectedFile);
      setParsedData(data);
      setErrors(errors);
      setStep("preview");
    },
    [parseExcelFile, addNotification]
  );

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  // Execute import
  const executeImport = useCallback(async () => {
    setStep("importing");
    setImportProgress(0);

    const results = { success: 0, failed: 0, skipped: 0 };
    const totalItems = parsedData.reduce(
      (acc, cat) => acc + cat.types.reduce((tAcc, type) => tAcc + type.models.length, 0),
      0
    );

    let processedItems = 0;

    try {
      for (const catData of parsedData) {
        // Check if category exists
        let existingCategory = categories.find(
          (c) => c.name.toLowerCase() === catData.name.toLowerCase()
        );

        let categoryId: number;

        if (!existingCategory) {
          // Create new category
          try {
            const newCategory = await createCategory({
              name: catData.name,
              isCustomerInstallable: catData.isCustomerInstallable,
              associatedDivisions: catData.associatedDivisions,
            });
            categoryId = newCategory.id;
            results.success++;
          } catch (error) {
            console.error("Failed to create category:", catData.name, error);
            results.failed++;
            continue;
          }
        } else {
          categoryId = existingCategory.id;
          results.skipped++;
        }

        // Refresh categories to get latest data
        await fetchCategories();
        const updatedCategories = useAssetStore.getState().categories;
        existingCategory = updatedCategories.find((c) => c.id === categoryId);

        for (const typeData of catData.types) {
          // Check if type exists
          const existingType = existingCategory?.types?.find(
            (t) => t.name.toLowerCase() === typeData.name.toLowerCase()
          );

          let typeId: number;

          if (!existingType) {
            // Create new type
            try {
              await createType({
                categoryId: categoryId,
                name: typeData.name,
                classification: typeData.classification.toUpperCase() as "ASSET" | "MATERIAL",
                trackingMethod: typeData.trackingMethod.toUpperCase() as "INDIVIDUAL" | "BULK",
                unitOfMeasure: typeData.unitOfMeasure,
              });
              // Refresh to get new type ID
              await fetchCategories();
              const refreshedCategories = useAssetStore.getState().categories;
              const refreshedCategory = refreshedCategories.find((c) => c.id === categoryId);
              const newType = refreshedCategory?.types?.find(
                (t) => t.name.toLowerCase() === typeData.name.toLowerCase()
              );
              typeId = newType?.id || 0;
              results.success++;
            } catch (error) {
              console.error("Failed to create type:", typeData.name, error);
              results.failed++;
              continue;
            }
          } else {
            typeId = existingType.id;
            results.skipped++;
          }

          // Refresh again for models
          await fetchCategories();
          const latestCategories = useAssetStore.getState().categories;
          const latestCategory = latestCategories.find((c) => c.id === categoryId);
          const latestType = latestCategory?.types?.find((t) => t.id === typeId);

          for (const modelData of typeData.models) {
            processedItems++;
            setImportProgress(Math.round((processedItems / totalItems) * 100));

            // Check if model exists
            const existingModel = (latestType?.models || latestType?.standardItems)?.find(
              (m) =>
                m.name.toLowerCase() === modelData.name.toLowerCase() &&
                m.brand.toLowerCase() === modelData.brand.toLowerCase()
            );

            if (!existingModel) {
              // Create new model
              try {
                await createModel({
                  typeId: typeId,
                  name: modelData.name,
                  brand: modelData.brand,
                });
                results.success++;
              } catch (error) {
                console.error("Failed to create model:", modelData.name, error);
                results.failed++;
              }
            } else {
              results.skipped++;
            }
          }
        }
      }

      setImportResults(results);
      setStep("complete");

      // Final refresh
      await fetchCategories();

      if (results.success > 0) {
        addNotification(`Import selesai! ${results.success} item berhasil ditambahkan.`, "success");
      }
    } catch (error) {
      console.error("Import error:", error);
      addNotification("Terjadi kesalahan saat import", "error");
      setStep("preview");
    }
  }, [
    parsedData,
    categories,
    createCategory,
    createType,
    createModel,
    fetchCategories,
    addNotification,
  ]);

  // Count statistics
  const stats = useMemo(() => {
    const totalCategories = parsedData.length;
    const totalTypes = parsedData.reduce((acc, cat) => acc + cat.types.length, 0);
    const totalModels = parsedData.reduce(
      (acc, cat) => acc + cat.types.reduce((tAcc, type) => tAcc + type.models.length, 0),
      0
    );
    const errorCount = errors.filter((e) => e.severity === "error").length;
    const warningCount = errors.filter((e) => e.severity === "warning").length;

    return { totalCategories, totalTypes, totalModels, errorCount, warningCount };
  }, [parsedData, errors]);

  // Render upload step
  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* Download Template Section */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary-100 rounded-lg">
            <BsDownload className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Langkah 1: Unduh Template</h3>
            <p className="text-sm text-gray-600 mb-3">
              Unduh template Excel, isi data kategori, tipe, dan model sesuai format yang
              disediakan.
            </p>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              <BsDownload className="w-4 h-4" />
              Unduh Template Excel
            </button>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div
        className="border-2 border-dashed rounded-xl p-8 transition-colors duration-200"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          borderColor: isDragging ? "#3b82f6" : "#e5e7eb",
          backgroundColor: isDragging ? "#eff6ff" : "transparent",
        }}
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BsUpload className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Langkah 2: Upload File</h3>
          <p className="text-sm text-gray-600 mb-4">
            Drag & drop file Excel atau klik tombol di bawah
          </p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium cursor-pointer">
            <BsUpload className="w-4 h-4" />
            Pilih File
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">Format: .xlsx, .xls</p>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
        <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
          <ExclamationTriangleIcon className="w-5 h-5" />
          Tips Import
        </h4>
        <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
          <li>Pastikan tidak ada baris kosong di tengah data</li>
          <li>Kategori & Tipe yang sama akan digabungkan otomatis</li>
          <li>Data yang sudah ada tidak akan ditimpa (dilewati)</li>
          <li>Hapus baris contoh pada template sebelum upload</li>
        </ul>
      </div>
    </div>
  );

  // Render preview step
  const renderPreviewStep = () => (
    <div className="space-y-6">
      {/* File info */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded">
            <BsCheckCircleFill className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{file?.name}</p>
            <p className="text-sm text-gray-500">{(file?.size || 0 / 1024).toFixed(1)} KB</p>
          </div>
        </div>
        <button
          onClick={() => {
            setFile(null);
            setParsedData([]);
            setErrors([]);
            setStep("upload");
          }}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.totalCategories}</p>
          <p className="text-sm text-blue-700">Kategori</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.totalTypes}</p>
          <p className="text-sm text-purple-700">Tipe</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.totalModels}</p>
          <p className="text-sm text-green-700">Model</p>
        </div>
      </div>

      {/* Errors and Warnings */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {stats.errorCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5" />
                {stats.errorCount} Error (Tidak akan diimport)
              </h4>
              <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                {errors
                  .filter((e) => e.severity === "error")
                  .map((error, i) => (
                    <li key={i}>
                      Baris {error.row}: {error.message}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {stats.warningCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5" />
                {stats.warningCount} Peringatan
              </h4>
              <ul className="text-sm text-amber-700 space-y-1 max-h-32 overflow-y-auto">
                {errors
                  .filter((e) => e.severity === "warning")
                  .map((error, i) => (
                    <li key={i}>
                      Baris {error.row}: {error.message}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Preview Data */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <h4 className="font-medium text-gray-700">Preview Data</h4>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {parsedData.map((category, catIndex) => (
            <div key={catIndex} className="border-b last:border-b-0">
              <div className="px-4 py-2 bg-blue-50">
                <span className="font-medium text-blue-800">{category.name}</span>
                {category.associatedDivisions.length > 0 && (
                  <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                    {divisions
                      .filter((d) => category.associatedDivisions.includes(d.id))
                      .map((d) => d.name)
                      .join(", ")}
                  </span>
                )}
                {category.isCustomerInstallable && (
                  <span className="ml-2 text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded">
                    Instalasi
                  </span>
                )}
              </div>
              {category.types.map((type, typeIndex) => (
                <div key={typeIndex} className="pl-8 pr-4 py-1 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{type.name}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        type.classification === "asset"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {type.classification}
                    </span>
                    <span className="text-xs text-gray-500">({type.trackingMethod})</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {type.models.map((model, modelIndex) => (
                      <span
                        key={modelIndex}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {model.name} - {model.brand}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={() => setStep("upload")}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Kembali
        </button>
        <button
          onClick={executeImport}
          disabled={stats.errorCount > 0 || stats.totalModels === 0}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Import {stats.totalModels} Model
        </button>
      </div>
    </div>
  );

  // Render importing step
  const renderImportingStep = () => (
    <div className="py-12 text-center">
      <SpinnerIcon className="w-12 h-12 text-primary-600 mx-auto animate-spin mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Sedang Mengimport Data...</h3>
      <p className="text-gray-600 mb-4">Mohon tunggu, jangan tutup halaman ini</p>
      <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${importProgress}%` }}
        />
      </div>
      <p className="text-sm text-gray-500 mt-2">{importProgress}%</p>
    </div>
  );

  // Render complete step
  const renderCompleteStep = () => (
    <div className="py-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <BsCheckCircleFill className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Import Selesai!</h3>
      <p className="text-gray-600 mb-6">Data berhasil diproses</p>

      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-green-600">{importResults.success}</p>
          <p className="text-sm text-green-700">Berhasil</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-amber-600">{importResults.skipped}</p>
          <p className="text-sm text-amber-700">Dilewati</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-red-600">{importResults.failed}</p>
          <p className="text-sm text-red-700">Gagal</p>
        </div>
      </div>

      <button
        onClick={handleClose}
        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
      >
        Selesai
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={step === "importing" ? () => {} : handleClose}
      title="Import Data Kategori & Model"
      size="lg"
    >
      <div className="p-6">
        {step === "upload" && renderUploadStep()}
        {step === "preview" && renderPreviewStep()}
        {step === "importing" && renderImportingStep()}
        {step === "complete" && renderCompleteStep()}
      </div>
    </Modal>
  );
};

export default BulkImportModal;
