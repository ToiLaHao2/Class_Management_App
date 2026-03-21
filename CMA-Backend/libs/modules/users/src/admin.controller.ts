import 'reflect-metadata';
import { Controller, Get, Route, Tags, Security } from '@tsoa/runtime';
import { IUsersService } from './user.service';

@Route('admin')
@Tags('Admin')
export class AdminController extends Controller {
    private readonly usersService: IUsersService;

    constructor({ usersService }: { usersService: IUsersService }) {
        super();
        this.usersService = usersService;
    }

    /**
     * Get combined dashboard stats (Users, Growth, etc.)
     */
    @Security('jwt', ['admin'])
    @Get('/stats')
    public async getDashboardStats(): Promise<any> {
        return this.usersService.getDashboardStats();
    }

    /**
     * Get system health and service status
     */
    @Security('jwt', ['admin'])
    @Get('/health')
    public async getSystemHealth(): Promise<any> {
        return this.usersService.getSystemHealth();
    }
}
