import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';

export function RequiresOne(
    properties: string[],
    validationOptions?: ValidationOptions,
) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'requiresOne',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: properties,
            validator: {
                validate(value: unknown, args: ValidationArguments) {
                    const object = args.object as Record<string, unknown>;
                    return properties.some(
                        (prop) =>
                            object[prop] !== null && object[prop] !== undefined,
                    );
                },
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                defaultMessage(_: ValidationArguments) {
                    return `At least one of the following must be provided: ${properties.join(', ')}`;
                },
            },
        });
    };
}
