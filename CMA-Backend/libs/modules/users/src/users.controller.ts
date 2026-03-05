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
} from '@tsoa/runtime';
import type { IUser, CreateUserDTO, UpdateUserDTO } from './user.model';

@Route('users')
@Tags('Users')
export class UsersController extends Controller {
    /**
     * Get all users
     */
    @Get('/')
    public async getUsers(): Promise<IUser[]> {
        // TODO: Integrate with UserService via DI
        return [
            {
                id: 'demo-1',
                email: 'student@cma.edu',
                fullName: 'Nguyen Van A',
                role: 'student',
                createdAt: new Date(),
                isDeleted: false,
            },
        ];
    }

    /**
     * Get a single user by ID
     * @param userId The user's unique identifier
     */
    @Get('{userId}')
    public async getUser(@Path() userId: string): Promise<IUser | null> {
        // TODO: Integrate with UserService via DI
        return {
            id: userId,
            email: 'student@cma.edu',
            fullName: 'Nguyen Van A',
            role: 'student',
            createdAt: new Date(),
            isDeleted: false,
        };
    }

    /**
     * Create a new user
     */
    @SuccessResponse('201', 'Created')
    @Post('/')
    public async createUser(@Body() body: CreateUserDTO): Promise<IUser> {
        // TODO: Integrate with UserService via DI
        this.setStatus(201);
        return {
            id: 'new-user-id',
            email: body.email,
            fullName: body.fullName,
            role: body.role,
            avatar: body.avatar,
            createdAt: new Date(),
            isDeleted: false,
        };
    }

    /**
     * Update a user
     * @param userId The user's unique identifier
     */
    @Put('{userId}')
    public async updateUser(
        @Path() userId: string,
        @Body() body: UpdateUserDTO
    ): Promise<IUser> {
        // TODO: Integrate with UserService via DI
        return {
            id: userId,
            email: 'student@cma.edu',
            fullName: body.fullName ?? 'Nguyen Van A',
            role: body.role ?? 'student',
            avatar: body.avatar,
            createdAt: new Date(),
            isDeleted: false,
        };
    }

    /**
     * Soft-delete a user
     * @param userId The user's unique identifier
     */
    @Delete('{userId}')
    public async deleteUser(@Path() userId: string): Promise<{ message: string }> {
        // TODO: Integrate with UserService via DI
        return { message: `User ${userId} has been deleted.` };
    }
}
