import React from 'react';
import { Dialog, Portal, Text, Button } from 'react-native-paper';

/**
 * Diálogo de confirmación reutilizable.
 * @param {{ visible: boolean, title: string, message: string,
 *           confirmLabel?: string, cancelLabel?: string,
 *           onConfirm: Function, onDismiss: Function,
 *           destructive?: boolean }} props
 */
export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onDismiss,
  destructive = false,
}) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{cancelLabel}</Button>
          <Button
            onPress={onConfirm}
            textColor={destructive ? '#D32F2F' : '#105E7A'}
          >
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
