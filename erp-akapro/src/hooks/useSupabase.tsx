"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useSupabase() {
    const [session, setSession] = useState<any>(null);
    const [tenant, setTenant] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);

            if (session) {
                try {
                    // Try to fetch tenant
                    const { data: tenantData, error: tenantError } = await supabase
                        .from('tenants')
                        .select('*')
                        .limit(1)
                        .maybeSingle();

                    if (tenantData) {
                        setTenant(tenantData);
                    } else {
                        // Fallback if no tenant in DB
                        setTenant({
                            id: '00000000-0000-0000-0000-000000000000',
                            name: 'Demo Organization',
                            slug: 'demo'
                        });
                    }
                } catch (e) {
                    // Fallback on error (e.g. table doesn't exist)
                    setTenant({
                        id: '00000000-0000-0000-0000-000000000000',
                        name: 'Demo Organization',
                        slug: 'demo'
                    });
                }
            } else {
                // Mock tenant for development if no session
                setTenant({
                    id: '00000000-0000-0000-0000-000000000000',
                    name: 'Demo Organization',
                    slug: 'demo'
                });
            }
            setLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (!session) {
                setTenant({
                    id: '00000000-0000-0000-0000-000000000000',
                    name: 'Demo Organization',
                    slug: 'demo'
                });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return {
        supabase,
        session,
        tenant,
        loading
    };
}
