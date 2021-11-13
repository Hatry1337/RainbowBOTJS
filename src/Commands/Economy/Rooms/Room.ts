import { User } from "../../../Models/User"
import { Player } from "../inventory/Player";
import { TileEntity } from "../TileEntitys/TileEntity";

export class Room{
    private name: string;
    private owner: Player;
    private members: Player[];
    private mechanisms: TileEntity[];

    constructor(name: string, owner: Player, members: Player[] = [], mechs: TileEntity[] = []){
        this.name = name;
        this.owner = owner;
        this.members = members;
        this.mechanisms = mechs;
    }
    
    public getName(){
        return this.name;
    }

    public setName(name: string){
        this.name = name;
    }

    public getOwner(){
        return this.owner;
    }

    public setOwner(owner: Player){
        this.owner = owner;
    }

    public getMembers(){
        return this.members;
    }

    public addMember(user: Player){
        if(!this.members.find(p => p.getUser().ID === p.getUser().ID)){
            this.members.push(user);
        }
    }

    public rmMember(user: Player){
        var i = this.members.findIndex(u => u.getUser().ID === user.getUser().ID);
        if(i !== -1){
            this.members.splice(i, 1);
        }
    }

    public hasMember(user: Player){
        var i = this.members.findIndex(u => u.getUser().ID === user.getUser().ID);
        return i !== -1;
    }

    public getMechs(){
        return this.mechanisms;
    }

    public getMech(index: number){
        if(index < this.mechanisms.length && index >= 0){
            return this.mechanisms[index];
        }
    }

    public addMechs(mech: TileEntity){
        if(this.mechanisms.indexOf(mech) === -1){
            this.mechanisms.push(mech);
        }
    }

    public rmMech(mech: TileEntity){
        var i = this.mechanisms.indexOf(mech);
        if(i !== -1){
            this.mechanisms.splice(i, 1);
        }
    }

    public hasMech(mech: TileEntity){
        var i = this.mechanisms.indexOf(mech);
        return i !== -1;
    }
}