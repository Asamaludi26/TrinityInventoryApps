/**
 * CustomerForm - Example form with Zod + React Hook Form Integration
 *
 * This component demonstrates the integration of:
 * - Zod schema validation
 * - React Hook Form for form state management
 * - TanStack Query mutations for API calls
 * - Design tokens for consistent styling
 */

import React from "react";
import { useZodForm } from "../../../hooks/useZodForm";
import {
  createCustomerSchema,
  type CreateCustomerInput,
} from "../../../validation";
import { useCreateCustomer, useUpdateCustomer } from "../../../hooks/queries";
import { useNotification } from "../../../providers/NotificationProvider";
import { SpinnerIcon } from "../../../components/icons/SpinnerIcon";
import type { Customer } from "../../../types";

interface CustomerFormProps {
  customer?: Customer;
  onSuccess?: (customer: Customer) => void;
  onCancel?: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  onSuccess,
  onCancel,
}) => {
  const isEditMode = !!customer;
  const addNotification = useNotification();

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const form = useZodForm(createCustomerSchema, {
    defaultValues: customer
      ? {
          name: customer.name,
          address: customer.address || "",
          phone: customer.phone || "",
          email: customer.email || "",
          servicePackage: customer.servicePackage || "",
          installationDate: customer.installationDate || "",
          notes: customer.notes || "",
          status: customer.status as "Active" | "Inactive" | "Suspended",
        }
      : {
          name: "",
          address: "",
          phone: "",
          email: "",
          servicePackage: "",
          installationDate: new Date().toISOString().split("T")[0],
          notes: "",
          status: "Active" as const,
        },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Ensure status has a default value
      const submitData = {
        ...data,
        status: data.status || ("Active" as const),
      };

      if (isEditMode && customer) {
        const result = await updateMutation.mutateAsync({
          id: customer.id,
          data: submitData as Partial<Customer>,
        });
        addNotification("Customer berhasil diperbarui.", "success");
        onSuccess?.(result);
      } else {
        const result = await createMutation.mutateAsync(
          submitData as Omit<Customer, "id">,
        );
        addNotification("Customer berhasil ditambahkan.", "success");
        onSuccess?.(result);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Gagal menyimpan customer.";
      addNotification(message, "error");
    }
  });

  const isLoading =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Nama Customer <span className="text-red-500">*</span>
        </label>
        <input
          {...register("name")}
          type="text"
          id="name"
          className={`
            w-full px-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
            ${errors.name ? "border-red-500" : "border-slate-300"}
          `}
          placeholder="Masukkan nama customer"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Address Field */}
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Alamat
        </label>
        <textarea
          {...register("address")}
          id="address"
          rows={3}
          className={`
            w-full px-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
            ${errors.address ? "border-red-500" : "border-slate-300"}
          `}
          placeholder="Masukkan alamat lengkap"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
        )}
      </div>

      {/* Phone & Email - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Telepon <span className="text-red-500">*</span>
          </label>
          <input
            {...register("phone")}
            type="tel"
            id="phone"
            className={`
              w-full px-3 py-2 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
              ${errors.phone ? "border-red-500" : "border-slate-300"}
            `}
            placeholder="08xxxxxxxxxx"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            className={`
              w-full px-3 py-2 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
              ${errors.email ? "border-red-500" : "border-slate-300"}
            `}
            placeholder="email@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Service Package & Installation Date - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="servicePackage"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Paket Layanan <span className="text-red-500">*</span>
          </label>
          <select
            {...register("servicePackage")}
            id="servicePackage"
            className={`
              w-full px-3 py-2 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
              ${errors.servicePackage ? "border-red-500" : "border-slate-300"}
            `}
          >
            <option value="">Pilih Paket</option>
            <option value="basic">Basic</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>
          {errors.servicePackage && (
            <p className="mt-1 text-sm text-red-500">
              {errors.servicePackage.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="installationDate"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Tanggal Instalasi <span className="text-red-500">*</span>
          </label>
          <input
            {...register("installationDate")}
            type="date"
            id="installationDate"
            className={`
              w-full px-3 py-2 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
              ${errors.installationDate ? "border-red-500" : "border-slate-300"}
            `}
          />
          {errors.installationDate && (
            <p className="mt-1 text-sm text-red-500">
              {errors.installationDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Status */}
      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Status
        </label>
        <select
          {...register("status")}
          id="status"
          className={`
            w-full px-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
            ${errors.status ? "border-red-500" : "border-slate-300"}
          `}
        >
          <option value="Active">Aktif</option>
          <option value="Inactive">Tidak Aktif</option>
          <option value="Suspended">Diblokir</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Catatan
        </label>
        <textarea
          {...register("notes")}
          id="notes"
          rows={2}
          className={`
            w-full px-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
            ${errors.notes ? "border-red-500" : "border-slate-300"}
          `}
          placeholder="Catatan tambahan (opsional)"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="
              px-4 py-2 text-sm font-medium text-slate-700 
              bg-white border border-slate-300 rounded-lg
              hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || (!isDirty && isEditMode)}
          className="
            px-4 py-2 text-sm font-medium text-white
            bg-sky-600 rounded-lg
            hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2
          "
        >
          {isLoading && <SpinnerIcon className="w-4 h-4 animate-spin" />}
          {isEditMode ? "Simpan Perubahan" : "Tambah Customer"}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;
