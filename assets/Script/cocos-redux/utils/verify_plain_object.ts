import isPlainObject from './is_plain_object';
import warning from './warning';

export default function verifyPlainObject(value: unknown, displayName: string, methodName: string) {
  if (!isPlainObject(value)) {
    warning(
      `${methodName}() in ${displayName} must return a plain object. Instead received ${value}.`,
    );
  }
}
