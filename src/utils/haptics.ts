import * as Haptics from 'expo-haptics';

export async function lightTap() {
  try {
    await Haptics.selectionAsync();
  } catch {
    // No-op on unsupported platforms or environments.
  }
}

export async function confirmTap() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // No-op on unsupported platforms or environments.
  }
}
