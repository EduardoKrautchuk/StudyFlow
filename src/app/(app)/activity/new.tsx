import { router } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';

import { AppButton } from '@/components/AppButton';
import { ComingSoon } from '@/components/ComingSoon';

export default function NewActivityScreen() {
  return (
    <ComingSoon
      icon={Plus}
      title="Nova atividade"
      action={
        <AppButton
          title="Voltar"
          icon={ArrowLeft}
          iconPosition="start"
          variant="outline"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
      }
    />
  );
}
