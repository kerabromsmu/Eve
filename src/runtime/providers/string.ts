//---------------------------------------------------------------------
// String providers
//---------------------------------------------------------------------

import {Constraint} from "../join";
import * as providers from "./index";

// Concat strings together. Args expects a set of variables/string constants
// to concatenate together and an array with a single return variable
class Concat extends Constraint {
  // To resolve a proposal, we concatenate our resolved args
  resolveProposal(proposal, prefix) {
    let {args} = this.resolve(prefix);
    return [args.join("")];
  }

  // We accept a prefix if the return is equivalent to concatentating
  // all the args
  test(prefix) {
    let {args, returns} = this.resolve(prefix);
    return args.join("") === returns[0];
  }

  // concat always returns cardinality 1
  getProposal(tripleIndex, proposed, prefix) {
    let proposal = this.proposalObject;
    proposal.providing = proposed;
    proposal.cardinality = 1;
    return proposal;
  }
}



class Split extends Constraint {
  static AttributeMapping = {
    "text": 0,
    "by": 1,
  }
  static ReturnMapping = {
    "token": 0,
    "index": 1,
  }

  returnType: "both" | "index" | "token";

  constructor(args: any[], returns: any[]) {
    super(args, returns);
    if(this.returns[1] !== undefined && this.returns[0] !== undefined) {
      this.returnType = "both"
    } else if(this.returns[1] !== undefined) {
      this.returnType = "index";
    } else {
      this.returnType = "token";
    }
  }

  resolveProposal(proposal, prefix) {
    let {returns} = this.resolve(prefix);
    let tokens = proposal.index;
    let results = tokens;
    if(this.returnType === "both") {
      results = [];
      let ix = 1;
      for(let token of tokens) {
        results.push([token, ix]);
        ix++;
      }
    } else if(this.returnType === "index") {
      results = [];
      let ix = 1;
      for(let token of tokens) {
        results.push(ix);
        ix++;
      }
    }
    return results;
  }

  test(prefix) {
    let {args, returns} = this.resolve(prefix);
    // @TODO: this is expensive, we should probably try to cache the split somehow
    return args[0].split(args[1])[returns[1]] === returns[0];
  }

  getProposal(tripleIndex, proposed, prefix) {
    let {args} = this.resolve(prefix);
    let proposal = this.proposalObject;
    if(this.returnType === "both") {
      proposal.providing = [this.returns[0], this.returns[1]];
    } else if(this.returnType == "index") {
      proposal.providing = this.returns[1];
    } else {
      proposal.providing = this.returns[0];
    }
    proposal.index = args[0].split(args[1]);
    proposal.cardinality = proposal.index.length;
    return proposal;
  }
}

providers.provide("concat", Concat);
providers.provide("split", Split);