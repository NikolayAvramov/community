"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

type LoginValues = { email: string; password: string };

export default function Login() {
  const { login } = useContext(AuthContext);
  const { register, handleSubmit, reset } = useForm<LoginValues>();
  const [error, setError] = useState<string | null>(null);

  const onSubmit: SubmitHandler<LoginValues> = async (data) => {
    setError(null);
    try {
      await login(data.email, data.password);
      reset();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          className="w-full bg-green-500 text-white p-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}
