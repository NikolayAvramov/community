"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

type FormValues = { name: string; email: string; password: string };

export default function Register() {
  const { register, handleSubmit, reset } = useForm<FormValues>();

  const mutation = useMutation<any, Error, FormValues>({
    mutationFn: async (data: FormValues) => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Registration failed");
      return res.json();
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    mutation.mutate(data, {
      onSuccess: () => reset(),
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h1 className="text-2xl font-bold mb-4">Register</h1>

      {mutation.isError && (
        <p className="text-red-500">Error: {mutation.error?.message}</p>
      )}
      {mutation.isSuccess && (
        <p className="text-green-500">Registered successfully!</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register("name", { required: true })}
          placeholder="Name"
          className="w-full p-2 border rounded"
        />
        <input
          {...register("email", { required: true })}
          placeholder="Email"
          type="email"
          className="w-full p-2 border rounded"
        />
        <input
          {...register("password", { required: true })}
          placeholder="Password"
          type="password"
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Register
        </button>
      </form>
    </div>
  );
}
