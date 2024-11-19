/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */


export class Is {
  static isTrackedFunction(value: any): boolean {
    const requiredProperties = [
      'getCalls',
      'getCall',
      'getLatestCall',
      'getCallCount',
      'getAllArgs',
      'getArgsForCall',
      'getReturnValues',
      'getExceptions',
      'wasCalled',
      'wasCalledWith',
      'wasCalledTimes',
      'return',
      'throw',
      'use',
      'reset',
    ];

    return requiredProperties.every((prop) => value.hasOwnProperty(prop));
  }

  
}