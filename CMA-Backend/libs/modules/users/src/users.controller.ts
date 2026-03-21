import 'reflect-metadata';
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Route,
    Path,
    Body,
    SuccessResponse,
    Tags,
    Security,
} from '@tsoa/runtime';
import type { IUser, CreateUserDTO, UpdateUserDTO } from './user.model';
import { IUsersService } from './user.service';

@Route('users')
@Tags('Users')
export class UsersController extends Controller {
    private readonly usersService: IUsersService;

    constructor({ usersService }: { usersService: IUsersService }) {
        super();
        this.usersService = usersService;
    }
    /**
     * Get all users (Admin only)
     */
    @Security('jwt', ['admin'])
    @Get('/')
    public async getUsers(): Promise<IUser[]> {
        const users = await this.usersService.getAllUsers();
        return users as unknown as IUser[];
    }

    /**
     * Get a single user by email
     * API này tạo phụ để test nhanh việc get User bằng DB
     */
    @Security('jwt')
    @Get('by-email/{email}')
    public async getUserByEmail(@Path() email: string): Promise<IUser | null> {
        const user = await this.usersService.getUserByEmail(email);
        if (!user) return null;
        const { passwordHash: _, ...safeUser } = user;
        return safeUser as unknown as IUser;
    }

    /**
     * Get a single user by ID
     * @param userId The user's unique identifier
     */
    @Security('jwt')
    @Get('{userId}')
    public async getUser(@Path() userId: string): Promise<IUser | null> {
        const user = await this.usersService.getUserById(userId);
        if (!user) return null;
        const { passwordHash: _, ...safeUser } = user;
        return safeUser as unknown as IUser;
    }

    /**
     * Create a new user (đã bị auth.controller đảm nhiệm nhưng vẫn giữ lại theo code cũ form)
     */
    @SuccessResponse('201', 'Created')
    @Post('/')
    public async createUser(@Body() body: CreateUserDTO): Promise<IUser> {
        const user = await this.usersService.createUser(body);
        this.setStatus(201);
        return user as unknown as IUser;
    }

    /**
     * Update a user (Admin only)
     * @param userId The user's unique identifier
     */
    @Security('jwt', ['admin'])
    @Put('{userId}')
    public async updateUser(
        @Path() userId: string,
        @Body() body: UpdateUserDTO
    ): Promise<IUser> {
        const updated = await this.usersService.updateProfile(userId, body);
        return updated as unknown as IUser;
    }

    /**
     * Soft-delete a user (Admin only)
     * @param userId The user's unique identifier
     */
    @Security('jwt', ['admin'])
    @Delete('{userId}')
    public async deleteUser(@Path() userId: string): Promise<{ message: string }> {
        return this.usersService.softDeleteUser(userId);
    }
}
