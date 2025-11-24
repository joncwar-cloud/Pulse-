import { supabase } from '../supabase';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export const storageService = {
  async uploadAvatar(userId: string, fileUri: string, mimeType: string = 'image/jpeg') {
    const fileExt = mimeType.split('/')[1] || 'jpg';
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    let fileData: ArrayBuffer;

    if (Platform.OS === 'web') {
      const response = await fetch(fileUri);
      fileData = await response.arrayBuffer();
    } else {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64' as any,
      });
      fileData = base64ToArrayBuffer(base64);
    }

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, fileData, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  },

  async uploadPostMedia(userId: string, fileUri: string, mimeType: string) {
    const fileExt = mimeType.split('/')[1] || 'jpg';
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    let fileData: ArrayBuffer;

    if (Platform.OS === 'web') {
      const response = await fetch(fileUri);
      fileData = await response.arrayBuffer();
    } else {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64' as any,
      });
      fileData = base64ToArrayBuffer(base64);
    }

    const { data, error } = await supabase.storage
      .from('posts')
      .upload(filePath, fileData, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from('posts')
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  },

  async uploadMultipleMedia(userId: string, files: { uri: string; mimeType: string }[]) {
    const uploadPromises = files.map(file =>
      this.uploadPostMedia(userId, file.uri, file.mimeType)
    );

    return await Promise.all(uploadPromises);
  },

  async uploadCommunityIcon(communityId: string, fileUri: string, mimeType: string = 'image/jpeg') {
    const fileExt = mimeType.split('/')[1] || 'jpg';
    const fileName = `icon-${communityId}-${Date.now()}.${fileExt}`;
    const filePath = `${communityId}/${fileName}`;

    let fileData: ArrayBuffer;

    if (Platform.OS === 'web') {
      const response = await fetch(fileUri);
      fileData = await response.arrayBuffer();
    } else {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64' as any,
      });
      fileData = base64ToArrayBuffer(base64);
    }

    const { data, error } = await supabase.storage
      .from('communities')
      .upload(filePath, fileData, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from('communities')
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  },

  async uploadMarketplaceImage(fileUri: string, userId: string, mimeType: string = 'image/jpeg') {
    const fileExt = mimeType.split('/')[1] || 'jpg';
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    let fileData: ArrayBuffer;

    if (Platform.OS === 'web') {
      const response = await fetch(fileUri);
      fileData = await response.arrayBuffer();
    } else {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64' as any,
      });
      fileData = base64ToArrayBuffer(base64);
    }

    const { data, error } = await supabase.storage
      .from('marketplace')
      .upload(filePath, fileData, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from('marketplace')
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  },

  async uploadChallengeImage(fileUri: string, userId: string, mimeType: string = 'image/jpeg') {
    const fileExt = mimeType.split('/')[1] || 'jpg';
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    let fileData: ArrayBuffer;

    if (Platform.OS === 'web') {
      const response = await fetch(fileUri);
      fileData = await response.arrayBuffer();
    } else {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64' as any,
      });
      fileData = base64ToArrayBuffer(base64);
    }

    const { data, error } = await supabase.storage
      .from('challenges')
      .upload(filePath, fileData, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from('challenges')
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  },

  async deleteFile(bucket: 'avatars' | 'posts' | 'communities' | 'marketplace' | 'challenges', filePath: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
  },

  getPublicUrl(bucket: 'avatars' | 'posts' | 'communities' | 'marketplace' | 'challenges', filePath: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },
};
