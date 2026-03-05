import { IocContainer } from '@tsoa/runtime';
import { container } from '@core/container';

/**
 * tsoa IoC Container Integration
 * 
 * tsoa gọi hàm `iocContainer.get()` để khởi tạo Controller.
 * Ta sử dụng Awilix container để resolve, nếu Controller chưa đăng ký
 * thì fallback về `new Controller()`.
 */
export const iocContainer: IocContainer = {
    get<T>(controller: { new(...args: any[]): T }): T {
        try {
            // Attempt to resolve from Awilix container by class name
            return container.resolve<T>(controller.name);
        } catch {
            // Fallback: create a new instance directly
            return new controller();
        }
    },
};
