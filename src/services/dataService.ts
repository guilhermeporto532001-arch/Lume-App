import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Client, Appointment, ServiceItem, ProductItem, Transaction } from '../types';
import {
  initialClients,
  initialAppointments,
  initialServices,
  initialProducts,
  initialTransactions,
} from '../data/mockData';

// Storage keys for offline / guest / instant local cache
const STORAGE_KEYS = {
  CLIENTS: 'lume_data_clients',
  APPOINTMENTS: 'lume_data_appointments',
  SERVICES: 'lume_data_services',
  PRODUCTS: 'lume_data_products',
  TRANSACTIONS: 'lume_data_transactions',
};

// Remove undefined values to prevent Firestore "Unsupported field value: undefined" errors
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  const cleaned: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

// Local Storage helpers
export function loadFromLocalStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (e) {
    console.warn(`Error reading localStorage for ${key}:`, e);
    return fallback;
  }
}

export function saveToLocalStorage<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error writing to localStorage for ${key}:`, e);
  }
}

// Initial state loader
export function loadInitialData() {
  return {
    clients: loadFromLocalStorage<Client>(STORAGE_KEYS.CLIENTS, initialClients),
    appointments: loadFromLocalStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS, initialAppointments),
    services: loadFromLocalStorage<ServiceItem>(STORAGE_KEYS.SERVICES, initialServices),
    products: loadFromLocalStorage<ProductItem>(STORAGE_KEYS.PRODUCTS, initialProducts),
    transactions: loadFromLocalStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS, initialTransactions),
  };
}

// Real-time synchronization with Firestore
export function subscribeToUserData(
  userId: string,
  onUpdate: (data: {
    clients?: Client[];
    appointments?: Appointment[];
    services?: ServiceItem[];
    products?: ProductItem[];
    transactions?: Transaction[];
  }) => void
) {
  // Only connect to Firestore if user is genuinely authenticated with Firebase
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return () => {};
  }

  const unsubs: (() => void)[] = [];

  try {
    // 1. Clients
    const qClients = query(collection(db, 'clients'), where('userId', '==', userId));
    unsubs.push(
      onSnapshot(
        qClients,
        (snap) => {
          const list: Client[] = [];
          snap.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              name: data.name || '',
              phone: data.phone || '',
              email: data.email,
              skinType: data.skinType,
              allergies: data.allergies,
              notes: data.notes,
              lastVisit: data.lastVisit,
              createdAt: data.createdAt,
            });
          });
          if (list.length > 0 || !snap.metadata.hasPendingWrites) {
            saveToLocalStorage(STORAGE_KEYS.CLIENTS, list);
            onUpdate({ clients: list });
          }
        },
        (err) => console.warn('Firestore clients listener error:', err)
      )
    );

    // 2. Appointments
    const qAppointments = query(collection(db, 'appointments'), where('userId', '==', userId));
    unsubs.push(
      onSnapshot(
        qAppointments,
        (snap) => {
          const list: Appointment[] = [];
          snap.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              clientId: data.clientId,
              clientName: data.clientName || '',
              serviceName: data.serviceName || '',
              date: data.date || '',
              time: data.time || '',
              durationMinutes: data.durationMinutes || 60,
              price: data.price || 0,
              status: data.status || 'agendado',
              notes: data.notes,
            });
          });
          if (list.length > 0 || !snap.metadata.hasPendingWrites) {
            saveToLocalStorage(STORAGE_KEYS.APPOINTMENTS, list);
            onUpdate({ appointments: list });
          }
        },
        (err) => console.warn('Firestore appointments listener error:', err)
      )
    );

    // 3. Services
    const qServices = query(collection(db, 'services'), where('userId', '==', userId));
    unsubs.push(
      onSnapshot(
        qServices,
        (snap) => {
          const list: ServiceItem[] = [];
          snap.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              name: data.name || '',
              category: data.category || 'Geral',
              durationMinutes: data.durationMinutes || 60,
              price: data.price || 0,
              description: data.description || '',
              isPackage: data.isPackage,
              includedServiceIds: data.includedServiceIds,
              includedServiceNames: data.includedServiceNames,
              originalPrice: data.originalPrice,
              postCareInstructions: data.postCareInstructions,
              postCareImageUrl: data.postCareImageUrl,
            });
          });
          if (list.length > 0 || !snap.metadata.hasPendingWrites) {
            saveToLocalStorage(STORAGE_KEYS.SERVICES, list);
            onUpdate({ services: list });
          }
        },
        (err) => console.warn('Firestore services listener error:', err)
      )
    );

    // 4. Products
    const qProducts = query(collection(db, 'products'), where('userId', '==', userId));
    unsubs.push(
      onSnapshot(
        qProducts,
        (snap) => {
          const list: ProductItem[] = [];
          snap.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              name: data.name || '',
              category: data.category || 'cabine',
              stock: data.stock ?? 0,
              minStock: data.minStock ?? 5,
              price: data.price ?? 0,
              unit: data.unit || 'un',
            });
          });
          if (list.length > 0 || !snap.metadata.hasPendingWrites) {
            saveToLocalStorage(STORAGE_KEYS.PRODUCTS, list);
            onUpdate({ products: list });
          }
        },
        (err) => console.warn('Firestore products listener error:', err)
      )
    );

    // 5. Transactions
    const qTransactions = query(collection(db, 'transactions'), where('userId', '==', userId));
    unsubs.push(
      onSnapshot(
        qTransactions,
        (snap) => {
          const list: Transaction[] = [];
          snap.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              description: data.description || '',
              type: data.type || 'receita',
              amount: data.amount ?? 0,
              date: data.date || '',
              category: data.category || 'Geral',
              paymentMethod: data.paymentMethod || 'Pix',
            });
          });
          if (list.length > 0 || !snap.metadata.hasPendingWrites) {
            saveToLocalStorage(STORAGE_KEYS.TRANSACTIONS, list);
            onUpdate({ transactions: list });
          }
        },
        (err) => console.warn('Firestore transactions listener error:', err)
      )
    );
  } catch (err) {
    console.warn('Failed to initialize Firestore real-time listeners:', err);
  }

  return () => {
    unsubs.forEach((unsub) => unsub());
  };
}

// Check and push local data to Firestore if Firestore is currently empty for this user
export async function syncLocalDataToFirestoreIfEmpty(
  userId: string,
  localState: {
    clients: Client[];
    appointments: Appointment[];
    services: ServiceItem[];
    products: ProductItem[];
    transactions: Transaction[];
  }
) {
  if (!auth.currentUser || auth.currentUser.uid !== userId) return;

  try {
    const clientsSnap = await getDocs(
      query(collection(db, 'clients'), where('userId', '==', userId))
    );
    // If user already has documents in the cloud, don't overwrite
    if (!clientsSnap.empty) return;

    const batch = writeBatch(db);
    let count = 0;

    localState.clients.forEach((c) => {
      const ref = doc(db, 'clients', c.id);
      batch.set(ref, sanitizeForFirestore({ ...c, userId }));
      count++;
    });

    localState.appointments.forEach((a) => {
      const ref = doc(db, 'appointments', a.id);
      batch.set(ref, sanitizeForFirestore({ ...a, userId }));
      count++;
    });

    localState.services.forEach((s) => {
      const ref = doc(db, 'services', s.id);
      batch.set(ref, sanitizeForFirestore({ ...s, userId }));
      count++;
    });

    localState.products.forEach((p) => {
      const ref = doc(db, 'products', p.id);
      batch.set(ref, sanitizeForFirestore({ ...p, userId }));
      count++;
    });

    localState.transactions.forEach((t) => {
      const ref = doc(db, 'transactions', t.id);
      batch.set(ref, sanitizeForFirestore({ ...t, userId }));
      count++;
    });

    if (count > 0) {
      await batch.commit();
      console.log(`Synced ${count} initial items to Firestore.`);
    }
  } catch (err) {
    console.warn('Could not sync initial local items to Firestore:', err);
  }
}

// CRUD persistence functions
export async function persistClient(client: Client, userId?: string | null) {
  if (auth.currentUser && userId) {
    try {
      await setDoc(doc(db, 'clients', client.id), sanitizeForFirestore({ ...client, userId }), {
        merge: true,
      });
    } catch (e) {
      console.warn('Error saving client to Firestore:', e);
    }
  }
}

export async function persistAppointment(appointment: Appointment, userId?: string | null) {
  if (auth.currentUser && userId) {
    try {
      await setDoc(
        doc(db, 'appointments', appointment.id),
        sanitizeForFirestore({ ...appointment, userId }),
        { merge: true }
      );
    } catch (e) {
      console.warn('Error saving appointment to Firestore:', e);
    }
  }
}

export async function persistAppointmentStatus(
  id: string,
  status: Appointment['status'],
  userId?: string | null
) {
  if (auth.currentUser && userId) {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
    } catch (e) {
      console.warn('Error updating appointment status in Firestore:', e);
    }
  }
}

export async function persistService(service: ServiceItem, userId?: string | null) {
  if (auth.currentUser && userId) {
    try {
      await setDoc(
        doc(db, 'services', service.id),
        sanitizeForFirestore({ ...service, userId }),
        { merge: true }
      );
    } catch (e) {
      console.warn('Error saving service to Firestore:', e);
    }
  }
}

export async function persistProduct(product: ProductItem, userId?: string | null) {
  if (auth.currentUser && userId) {
    try {
      await setDoc(
        doc(db, 'products', product.id),
        sanitizeForFirestore({ ...product, userId }),
        { merge: true }
      );
    } catch (e) {
      console.warn('Error saving product to Firestore:', e);
    }
  }
}

export async function persistProductStock(
  productId: string,
  stock: number,
  userId?: string | null
) {
  if (auth.currentUser && userId) {
    try {
      await updateDoc(doc(db, 'products', productId), { stock });
    } catch (e) {
      console.warn('Error updating product stock in Firestore:', e);
    }
  }
}

export async function persistTransaction(tx: Transaction, userId?: string | null) {
  if (auth.currentUser && userId) {
    try {
      await setDoc(doc(db, 'transactions', tx.id), sanitizeForFirestore({ ...tx, userId }), {
        merge: true,
      });
    } catch (e) {
      console.warn('Error saving transaction to Firestore:', e);
    }
  }
}

export async function removeTransaction(txId: string, userId?: string | null) {
  if (auth.currentUser && userId) {
    try {
      await deleteDoc(doc(db, 'transactions', txId));
    } catch (e) {
      console.warn('Error deleting transaction from Firestore:', e);
    }
  }
}
