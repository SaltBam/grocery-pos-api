import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function RequiresOne(properties: string[], validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'requiresOne',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: properties,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const object = args.object as any;
                    return properties.some(prop => object[prop] !== null && object[prop] !== undefined);
                },
                defaultMessage(args: ValidationArguments) {
                    return `At least one of the following must be provided: ${properties.join(', ')}`;
                },
            },
        });
    };
}
