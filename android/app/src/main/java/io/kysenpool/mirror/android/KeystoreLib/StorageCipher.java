package io.kysenpool.mirror.android.KeystoreLib;

public interface StorageCipher {
  byte[] encrypt(byte[] input) throws Exception;

  byte[] decrypt(byte[] input) throws Exception;
}
