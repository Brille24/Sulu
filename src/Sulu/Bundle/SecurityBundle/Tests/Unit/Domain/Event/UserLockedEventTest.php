<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\SecurityBundle\Tests\Unit\Domain\Event;

use PHPUnit\Framework\TestCase;
use Prophecy\PhpUnit\ProphecyTrait;
use Sulu\Bundle\SecurityBundle\Domain\Event\UserLockedEvent;
use Sulu\Component\Security\Authentication\UserInterface;

class UserLockedEventTest extends TestCase
{
    use ProphecyTrait;

    public function testGetEventType(): void
    {
        $user = $this->prophesize(UserInterface::class);
        $event = new UserLockedEvent($user->reveal());

        $this->assertSame($event->getEventType(), 'locked');
    }

    public function testGetResourceKey(): void
    {
        $user = $this->prophesize(UserInterface::class);
        $event = new UserLockedEvent($user->reveal());

        $this->assertSame('users', $event->getResourceKey());
    }

    public function testGetResourceId(): void
    {
        $user = $this->prophesize(UserInterface::class);
        $user->getId()->shouldBeCalled()->willReturn(1);
        $event = new UserLockedEvent($user->reveal());

        $this->assertSame('1', $event->getResourceId());
    }

    public function testGetResourceSecurityContext(): void
    {
        $user = $this->prophesize(UserInterface::class);
        $event = new UserLockedEvent($user->reveal());

        $this->assertSame('sulu.security.users', $event->getResourceSecurityContext());
    }
}
