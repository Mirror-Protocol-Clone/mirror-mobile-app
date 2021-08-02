//
//  RootCheck.m
//
//  Created by Henry on 2020/12/14.
//

#import "RootChecker.h"
#include <TargetConditionals.h>
@import UIKit;
@import Darwin.sys.sysctl;

static NSString * const JMJailbreakTextFile = @"/private/jailbreak.txt";
static NSString * const JMisJailBronkenKey = @"isJailBroken";
static NSString * const JMCanMockLocationKey = @"canMockLocation";

@implementation RootChecker

RCT_EXPORT_MODULE();

- (NSArray *)pathsToCheck
{
  return @[
    @"/Applications/Cydia.app",
    @"/Library/MobileSubstrate/MobileSubstrate.dylib",
    @"/bin/bash",
    @"/usr/sbin/sshd",
    @"/etc/apt",
    @"/private/var/lib/apt",
    @"/usr/sbin/frida-server",
    @"/usr/bin/cycript",
    @"/usr/local/bin/cycript",
    @"/usr/lib/libcycript.dylib",
    @"/Applications/FakeCarrier.app",
    @"/Applications/Icy.app",
    @"/Applications/IntelliScreen.app",
    @"/Applications/MxTube.app",
    @"/Applications/RockApp.app",
    @"/Applications/SBSettings.app",
    @"/Applications/WinterBoard.app",
    @"/Applications/blackra1n.app",
    @"/Library/MobileSubstrate/DynamicLibraries/LiveClock.plist",
    @"/Library/MobileSubstrate/DynamicLibraries/Veency.plist",
    @"/System/Library/LaunchDaemons/com.ikey.bbot.plist",
    @"/System/Library/LaunchDaemons/com.saurik.Cydia.Startup.plist",
    @"/bin/sh",
    @"/etc/ssh/sshd_config",
    @"/private/var/lib/cydia",
    @"/private/var/mobile/Library/SBSettings/Themes",
    @"/private/var/stash",
    @"/private/var/tmp/cydia.log",
    @"/usr/bin/sshd",
    @"/usr/libexec/sftp-server",
    @"/usr/libexec/ssh-keysign",
    @"/var/cache/apt",
    @"/var/lib/apt",
    @"/var/lib/cydia",
  ];
}

- (NSArray *)schemesToCheck
{
  return @[
    @"cydia://package/com.example.package",
  ];
}

- (BOOL)checkPaths
{
  BOOL existsPath = NO;
  
  for (NSString *path in [self pathsToCheck]) {
    if ([[NSFileManager defaultManager] fileExistsAtPath:path]){
      existsPath = YES;
      break;
    }
  }
  
  return existsPath;
}

- (BOOL)checkSchemes
{
  BOOL canOpenScheme = NO;
  
  for (NSString *scheme in [self schemesToCheck]) {
    if([[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:scheme]]){
      canOpenScheme = YES;
      break;
    }
  }
  
  return canOpenScheme;
}

- (BOOL)canViolateSandbox{
  NSError *error;
  BOOL grantsToWrite = NO;
  NSString *stringToBeWritten = @"This is an anti-spoofing test.";
  [stringToBeWritten writeToFile:JMJailbreakTextFile atomically:YES
                        encoding:NSUTF8StringEncoding error:&error];
  if(!error){
    //Device is jailbroken
    grantsToWrite = YES;
  }
  
  [[NSFileManager defaultManager] removeItemAtPath:JMJailbreakTextFile error:nil];
  
  return grantsToWrite;
}

RCT_EXPORT_METHOD(isDeviceRooted:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) __unused reject) {
#if TARGET_OS_SIMULATOR
  return resolve(@NO);
#endif
  return resolve([self checkPaths] || [self checkSchemes] || [self canViolateSandbox] ? @YES : @NO);
}

@end

