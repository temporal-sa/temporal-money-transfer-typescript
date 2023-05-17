import { Context } from '@temporalio/activity';

export async function testActivity(arg: string): Promise<string> {
  return "test";
}
