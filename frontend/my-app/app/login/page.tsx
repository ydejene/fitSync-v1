import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [message,  setMessage]  = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    const msg = searchParams.get('message');
    if (msg) setMessage(msg);
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      const { role }  = response.data.data.user;

      if (role === 'owner' || role === 'staff') {
        router.push('/dashboard');
      } else {
        router.push('/portal');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };