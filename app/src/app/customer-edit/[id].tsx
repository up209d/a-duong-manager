import { useLocalSearchParams } from 'expo-router';

import { PartyForm } from '@/components/party-form';

export default function CustomerEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PartyForm kind="customers" partyId={parseInt(id || '0', 10)} />;
}
