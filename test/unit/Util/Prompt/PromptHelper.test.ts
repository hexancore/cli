import type Enquirer from 'enquirer';
import { mock, type M } from '@hexancore/mocker';
import { PromptHelper } from '@/Util';

describe('PromptHelper', () => {
  let enquirer: M<Enquirer>;
  let helper: PromptHelper;
  beforeEach(() => {
    enquirer = mock();
    helper = new PromptHelper(enquirer.i);
  });

  afterEach(() => {
    enquirer.checkExpections();
  });

  describe('prompt', () => {
    test('multiple', async () => {
      enquirer.expects('prompt', expect.anything()).andReturnWith(async (prompts) => {
        expect(prompts).toEqual([{ name: 'p1', type: 'input', message: '1' }, { name: 'p2', type: 'input', message: '2' }]);
        return {
          p1: 'test_1',
          p2: 'test_2'
        };
      });

      const result = await helper.prompt({
        p1: { type: 'input', message: '1' },
        p2: { type: 'input', message: '2' },
      });

      expect(result).toMatchSuccessResult({ p1: 'test_1', p2: 'test_2' });
    });
  });
});

