import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
    addDoc,
    serverTimestamp,
    QueryConstraint,
    CollectionReference,
} from 'firebase/firestore';
import { db } from './config';

// Types
export interface UserProfile {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    role: 'buyer' | 'seller' | 'both';
    photoURL: string | null;
    shopName: string | null;
    shopAddress: string | null;
    marketArea: string | null;
    location: { lat: number; lng: number } | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Demand {
    id: string;
    buyerId: string;
    buyerName: string;
    title: string;
    description: string;
    category: 'clothing' | 'fashion' | 'textiles' | 'accessories';
    imageURL: string;
    budget: { min: number; max: number };
    location: { lat: number; lng: number; address: string };
    targetMarketArea: string | null;
    status: 'active' | 'matched' | 'expired' | 'cancelled';
    expiresAt: Timestamp;
    createdAt: Timestamp;
    bidCount: number;
    selectedBidId: string | null;
}

export interface Bid {
    id: string;
    demandId: string;
    sellerId: string;
    sellerName: string;
    shopName: string;
    offerPrice: number;
    imageURL: string;
    description: string;
    availability: 'in_stock' | 'can_arrange';
    shopLocation: { lat: number; lng: number; address: string };
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Timestamp;
}

// Helper to check if Firebase is configured
const checkDb = () => {
    if (!db) {
        throw new Error('Firestore not initialized. Please configure Firebase credentials.');
    }
    return db;
};

// Collection getters (lazy initialization)
const getUsersCollection = () => collection(checkDb(), 'users');
const getDemandsCollection = () => collection(checkDb(), 'demands');
const getBidsCollection = () => collection(checkDb(), 'bids');

// User operations
export const createUserProfile = async (
    userId: string,
    data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> => {
    await setDoc(doc(getUsersCollection(), userId), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const docSnap = await getDoc(doc(getUsersCollection(), userId));
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as UserProfile;
    }
    return null;
};

export const updateUserProfile = async (
    userId: string,
    data: Partial<UserProfile>
): Promise<void> => {
    await updateDoc(doc(getUsersCollection(), userId), {
        ...data,
        updatedAt: serverTimestamp(),
    });
};

// Demand operations
export const createDemand = async (
    data: Omit<Demand, 'id' | 'createdAt' | 'bidCount' | 'selectedBidId'>
): Promise<string> => {
    const docRef = await addDoc(getDemandsCollection(), {
        ...data,
        createdAt: serverTimestamp(),
        bidCount: 0,
        selectedBidId: null,
    });
    return docRef.id;
};

export const getDemand = async (demandId: string): Promise<Demand | null> => {
    const docSnap = await getDoc(doc(getDemandsCollection(), demandId));
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Demand;
    }
    return null;
};

export const getActiveDemands = async (constraints: QueryConstraint[] = []): Promise<Demand[]> => {
    if (!db) return [];
    const q = query(
        getDemandsCollection(),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        ...constraints
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Demand));
};

export const subscribeToActiveDemands = (
    callback: (demands: Demand[]) => void,
    constraints: QueryConstraint[] = []
) => {
    if (!db) {
        callback([]);
        return () => { };
    }
    const q = query(
        getDemandsCollection(),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        ...constraints
    );
    return onSnapshot(q, (querySnapshot) => {
        const demands = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Demand));
        callback(demands);
    });
};

export const updateDemand = async (
    demandId: string,
    data: Partial<Demand>
): Promise<void> => {
    await updateDoc(doc(getDemandsCollection(), demandId), data);
};

// Bid operations
export const createBid = async (
    data: Omit<Bid, 'id' | 'createdAt' | 'status'>
): Promise<string> => {
    const docRef = await addDoc(getBidsCollection(), {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
    });

    // Increment bid count on demand
    const demandRef = doc(getDemandsCollection(), data.demandId);
    const demandSnap = await getDoc(demandRef);
    if (demandSnap.exists()) {
        await updateDoc(demandRef, {
            bidCount: (demandSnap.data().bidCount || 0) + 1,
        });
    }

    return docRef.id;
};

export const getBidsForDemand = async (demandId: string): Promise<Bid[]> => {
    if (!db) return [];
    const q = query(
        getBidsCollection(),
        where('demandId', '==', demandId),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Bid));
};

export const subscribeToBidsForDemand = (
    demandId: string,
    callback: (bids: Bid[]) => void
) => {
    if (!db) {
        callback([]);
        return () => { };
    }
    const q = query(
        getBidsCollection(),
        where('demandId', '==', demandId),
        orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (querySnapshot) => {
        const bids = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Bid));
        callback(bids);
    });
};

export const updateBid = async (
    bidId: string,
    data: Partial<Bid>
): Promise<void> => {
    await updateDoc(doc(getBidsCollection(), bidId), data);
};

export const getSellerBids = async (sellerId: string): Promise<Bid[]> => {
    if (!db) return [];
    const q = query(
        getBidsCollection(),
        where('sellerId', '==', sellerId),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Bid));
};

// Notification Types
export interface Notification {
    id: string;
    userId: string;
    type: 'new_bid' | 'new_demand' | 'bid_accepted' | 'demand_expired';
    title: string;
    message: string;
    linkTo: string;
    read: boolean;
    createdAt: Timestamp;
}

const getNotificationsCollection = () => collection(checkDb(), 'notifications');

// User Demands operations
export const getUserDemands = async (buyerId: string): Promise<Demand[]> => {
    if (!db) return [];
    const q = query(
        getDemandsCollection(),
        where('buyerId', '==', buyerId),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Demand));
};

export const subscribeToUserDemands = (
    buyerId: string,
    callback: (demands: Demand[]) => void
) => {
    if (!db) {
        callback([]);
        return () => { };
    }
    const q = query(
        getDemandsCollection(),
        where('buyerId', '==', buyerId),
        orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (querySnapshot) => {
        const demands = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Demand));
        callback(demands);
    });
};

// Notification operations
export const createNotification = async (
    data: Omit<Notification, 'id' | 'createdAt' | 'read'>
): Promise<string> => {
    const docRef = await addDoc(getNotificationsCollection(), {
        ...data,
        read: false,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
    if (!db) return [];
    const q = query(
        getNotificationsCollection(),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Notification));
};

export const subscribeToUserNotifications = (
    userId: string,
    callback: (notifications: Notification[]) => void
) => {
    if (!db) {
        callback([]);
        return () => { };
    }
    const q = query(
        getNotificationsCollection(),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (querySnapshot) => {
        const notifications = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Notification));
        callback(notifications);
    });
};

export const markNotificationRead = async (notificationId: string): Promise<void> => {
    await updateDoc(doc(getNotificationsCollection(), notificationId), { read: true });
};

export const markAllNotificationsRead = async (userId: string): Promise<void> => {
    const notifications = await getUserNotifications(userId);
    const unreadNotifications = notifications.filter((n) => !n.read);
    for (const notification of unreadNotifications) {
        await markNotificationRead(notification.id);
    }
};
