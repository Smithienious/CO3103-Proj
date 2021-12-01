import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { sign, Sign } from 'crypto';

import { Account } from './account.entity';
import { AuthProvider } from './account.enum';
import { AuthCredentialDto } from './dto/auth-credentials.dto';
import { SignInCredentialDto } from './dto/sign-in-credentials.dto';

@EntityRepository(Account)
export class AccountRepository extends Repository<Account>{
  async getAccountByEmail(email: string): Promise<Account> {
    const accounts = await this.find({
      where: [
        email,
      ],
    });
    return accounts.at(0);
  }

  async createUser(authCredentialDto: AuthCredentialDto): Promise<void> {
    const { email, password, firstName } = authCredentialDto;
    
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const account = this.create({
      authProvider: AuthProvider.BASIC,
      email,
      password: hashedPassword,
      first_name: firstName,
      last_name: "N/A",
      male: true,
      address: "N/A",
      balance: 0,
      total_point: 0,
      cur_point: 0,
      role: "customer"
    })
    try {
      await this.save(account)
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException("User already exists")
      }
      else {
        console.log(error);
        throw new InternalServerErrorException();}
    };
  }

  async saveGoogleUser(authCredentialDto: AuthCredentialDto,lastName: string): Promise<string>{
    const {email, firstName} = authCredentialDto;
    const user = this.create({
      authProvider: AuthProvider.GOOGLE,
      email,
      first_name: firstName,
      last_name: lastName,
      balance: 0,
      total_point: 0,
      cur_point: 0,
      role: "customer"
    })
    try {
      await this.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException("User already exists")
      }
      else {
        console.log(error);
        throw new InternalServerErrorException();}
    };
    return "success";
  }




}
